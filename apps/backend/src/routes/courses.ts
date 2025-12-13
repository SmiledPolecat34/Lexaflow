import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { authenticate, requireConsent } from '../middleware/auth.js';
import { paginationSchema, updateProgressSchema } from '../schemas/index.js';
import { generateCourseContent, generatePlacementTest, calculatePlacementLevel } from '../services/ai.js';
import { checkAIRateLimit } from '../config/redis.js';

export const courseRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ==========================================================================
  // GET COURSES
  // ==========================================================================
  app.get('/', {
    schema: {
      tags: ['courses'],
      summary: 'Get available courses',
    },
  }, async (request, reply) => {
    const { type, level } = request.query as { type?: string; level?: string };

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(type && { type: type as any }),
        ...(level && { level: level as any }),
      },
      select: {
        id: true,
        type: true,
        level: true,
        title: true,
        description: true,
        duration: true,
        order: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return reply.send(
      courses.map((c) => ({
        ...c,
        lessonCount: c._count.lessons,
      }))
    );
  });

  // ==========================================================================
  // GET COURSES BY TYPE
  // ==========================================================================
  app.get('/grammar', {
    schema: {
      tags: ['courses'],
      summary: 'Get grammar courses',
    },
  }, async (request, reply) => {
    const courses = await prisma.course.findMany({
      where: { type: 'GRAMMAR', isPublished: true },
      orderBy: { order: 'asc' },
    });
    return reply.send(courses);
  });

  app.get('/conjugation', {
    schema: {
      tags: ['courses'],
      summary: 'Get conjugation courses',
    },
  }, async (request, reply) => {
    const courses = await prisma.course.findMany({
      where: { type: 'CONJUGATION', isPublished: true },
      orderBy: { order: 'asc' },
    });
    return reply.send(courses);
  });

  app.get('/vocabulary', {
    schema: {
      tags: ['courses'],
      summary: 'Get vocabulary courses',
    },
  }, async (request, reply) => {
    const courses = await prisma.course.findMany({
      where: { type: 'VOCABULARY', isPublished: true },
      orderBy: { order: 'asc' },
    });
    return reply.send(courses);
  });

  // ==========================================================================
  // GET COURSE BY ID
  // ==========================================================================
  app.get('/:id', {
    schema: {
      tags: ['courses'],
      summary: 'Get course details',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      return reply.status(404).send({
        error: true,
        message: 'Course not found',
      });
    }

    return reply.send(course);
  });

  // ==========================================================================
  // GET COURSE PROGRESS
  // ==========================================================================
  app.get('/:id/progress', {
    preHandler: [authenticate],
    schema: {
      tags: ['courses'],
      summary: 'Get course progress',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.userId!;

    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId: id },
      },
    });

    if (!progress) {
      return reply.send({
        started: false,
        progressPercent: 0,
        completedLessons: [],
      });
    }

    return reply.send({
      started: true,
      ...progress,
    });
  });

  // ==========================================================================
  // UPDATE COURSE PROGRESS
  // ==========================================================================
  app.post('/:id/progress', {
    preHandler: [authenticate],
    schema: {
      tags: ['courses'],
      summary: 'Update course progress',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { lessonId, completed } = updateProgressSchema.parse(request.body);
    const userId = request.userId!;

    // Get course to calculate progress
    const course = await prisma.course.findUnique({
      where: { id },
      include: { lessons: true },
    });

    if (!course) {
      return reply.status(404).send({
        error: true,
        message: 'Course not found',
      });
    }

    // Get or create progress
    let progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId: id },
      },
    });

    let completedLessons = (progress?.completedLessons || []) as string[];

    if (completed && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    } else if (!completed) {
      completedLessons = completedLessons.filter((l) => l !== lessonId);
    }

    const progressPercent = (completedLessons.length / course.lessons.length) * 100;
    const isCompleted = progressPercent >= 100;

    progress = await prisma.courseProgress.upsert({
      where: {
        userId_courseId: { userId, courseId: id },
      },
      create: {
        userId,
        courseId: id,
        completedLessons,
        currentLesson: lessonId,
        progressPercent,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        completedLessons,
        currentLesson: lessonId,
        progressPercent,
        completedAt: isCompleted ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LESSON_COMPLETED',
        resource: 'course',
        resourceId: id,
        metadata: { lessonId, progressPercent },
      },
    });

    return reply.send(progress);
  });

  // ==========================================================================
  // GENERATE COURSE CONTENT
  // ==========================================================================
  app.post('/generate', {
    preHandler: [authenticate, requireConsent],
    schema: {
      tags: ['courses'],
      summary: 'Generate AI course content',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { topic, level, type } = request.body as {
      topic: string;
      level: string;
      type: string;
    };
    const userId = request.userId!;

    // Check rate limit
    const rateLimit = await checkAIRateLimit(userId);
    if (!rateLimit.allowed) {
      return reply.status(429).send({
        error: true,
        message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
      });
    }

    const result = await generateCourseContent(userId, {
      topic,
      level: level as any,
      type: type as any,
    });

    if (result.error) {
      return reply.status(500).send({
        error: true,
        message: result.error,
      });
    }

    return reply.send({
      ...result.data,
      cached: result.cached,
    });
  });

  // ==========================================================================
  // GET RECOMMENDATIONS
  // ==========================================================================
  app.get('/recommendations', {
    preHandler: [authenticate],
    schema: {
      tags: ['courses'],
      summary: 'Get personalized course recommendations',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const userId = request.userId!;

    // Get user level and history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    // Get completed courses
    const completedCourses = await prisma.courseProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { courseId: true },
    });

    const completedIds = completedCourses.map((c) => c.courseId);

    // Get exercise results to identify weak areas
    const recentResults = await prisma.exerciseResult.findMany({
      where: { userId },
      include: { exercise: { select: { type: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    // Calculate weak areas
    const typeScores: Record<string, { total: number; count: number }> = {};
    for (const result of recentResults) {
      const type = result.exercise.type;
      if (!typeScores[type]) {
        typeScores[type] = { total: 0, count: 0 };
      }
      typeScores[type].total += result.percentage;
      typeScores[type].count++;
    }

    const weakAreas = Object.entries(typeScores)
      .map(([type, scores]) => ({
        type,
        avgScore: scores.total / scores.count,
      }))
      .filter((t) => t.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore);

    // Get recommended courses
    const recommendations = await prisma.course.findMany({
      where: {
        id: { notIn: completedIds },
        isPublished: true,
        level: user?.level || 'A1',
      },
      take: 5,
      orderBy: { order: 'asc' },
    });

    return reply.send({
      recommendations,
      weakAreas: weakAreas.slice(0, 3),
      userLevel: user?.level,
    });
  });

  // ==========================================================================
  // PLACEMENT TEST
  // ==========================================================================
  app.get('/placement-test', {
    preHandler: [authenticate],
    schema: {
      tags: ['courses'],
      summary: 'Get placement test questions',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const result = await generatePlacementTest();

    if (result.error) {
      return reply.status(500).send({
        error: true,
        message: result.error,
      });
    }

    return reply.send({
      questions: result.data,
      totalQuestions: result.data?.length || 25,
      passingScore: 80,
    });
  });

  // ==========================================================================
  // SUBMIT PLACEMENT TEST
  // ==========================================================================
  app.post('/placement-test', {
    preHandler: [authenticate],
    schema: {
      tags: ['courses'],
      summary: 'Submit placement test answers',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { answers, questions } = request.body as {
      answers: { questionId: string; answer: string }[];
      questions: any[];
    };
    const userId = request.userId!;

    const result = calculatePlacementLevel(answers, questions);

    // Save test result
    await prisma.placementTest.create({
      data: {
        userId,
        score: result.score,
        level: result.level,
        passed: result.passed,
        answers: answers as object,
        analysis: {
          determinedLevel: result.level,
          score: result.score,
          questionCount: questions.length,
        },
      },
    });

    // Update user level
    await prisma.user.update({
      where: { id: userId },
      data: { level: result.level },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PLACEMENT_TEST_COMPLETED',
        resource: 'placement_test',
        metadata: { level: result.level, score: result.score, passed: result.passed },
      },
    });

    return reply.send({
      ...result,
      message: result.passed
        ? `Félicitations ! Votre niveau est ${result.level}.`
        : `Votre niveau actuel est ${result.level}. Continuez à pratiquer !`,
    });
  });
};
