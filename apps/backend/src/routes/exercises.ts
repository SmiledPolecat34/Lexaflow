import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { authenticate, requireConsent } from '../middleware/auth.js';
import {
  generateExerciseSchema,
  submitAnswerSchema,
  paginationSchema,
} from '../schemas/index.js';
import { generateExercise, evaluateAnswer } from '../services/ai.js';
import { checkAIRateLimit } from '../config/redis.js';

export const exerciseRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ==========================================================================
  // GET EXERCISE TYPES
  // ==========================================================================
  app.get('/types', {
    schema: {
      tags: ['exercises'],
      summary: 'Get available exercise types',
    },
  }, async (_request, reply) => {
    const types = [
      {
        id: 'INFINITIVE_VERBS',
        name: 'Verbes à l\'infinitif',
        description: 'Exercices sur les formes de base des verbes',
        icon: '📝',
      },
      {
        id: 'CONJUGATION',
        name: 'Conjugaison',
        description: 'Pratiquez les temps verbaux anglais',
        icon: '⏰',
      },
      {
        id: 'VOCABULARY',
        name: 'Vocabulaire',
        description: 'Enrichissez votre vocabulaire',
        icon: '📚',
      },
      {
        id: 'GRAMMAR',
        name: 'Grammaire',
        description: 'Maîtrisez les règles grammaticales',
        icon: '📖',
      },
      {
        id: 'READING',
        name: 'Compréhension écrite',
        description: 'Lisez et répondez aux questions',
        icon: '👓',
      },
      {
        id: 'TRANSLATION',
        name: 'Traduction',
        description: 'Traduisez du français vers l\'anglais',
        icon: '🔄',
      },
      {
        id: 'FILL_BLANK',
        name: 'Textes à trous',
        description: 'Complétez les phrases',
        icon: '✏️',
      },
      {
        id: 'MULTIPLE_CHOICE',
        name: 'QCM',
        description: 'Choix multiples',
        icon: '☑️',
      },
      {
        id: 'MATCHING',
        name: 'Correspondance',
        description: 'Associez les éléments',
        icon: '🔗',
      },
    ];

    return reply.send(types);
  });

  // ==========================================================================
  // GET LEVELS
  // ==========================================================================
  app.get('/levels', {
    schema: {
      tags: ['exercises'],
      summary: 'Get CEFR levels',
    },
  }, async (_request, reply) => {
    const levels = [
      { id: 'A1', name: 'Débutant', description: 'Niveau découverte' },
      { id: 'A2', name: 'Élémentaire', description: 'Niveau de survie' },
      { id: 'B1', name: 'Intermédiaire', description: 'Niveau seuil' },
      { id: 'B2', name: 'Intermédiaire supérieur', description: 'Niveau avancé' },
      { id: 'C1', name: 'Avancé', description: 'Niveau autonome' },
      { id: 'C2', name: 'Maîtrise', description: 'Niveau maîtrise' },
    ];

    return reply.send(levels);
  });

  // ==========================================================================
  // GET THEMES
  // ==========================================================================
  app.get('/themes', {
    schema: {
      tags: ['exercises'],
      summary: 'Get available themes',
    },
  }, async (_request, reply) => {
    const themes = [
      { id: 'general', name: 'Général', icon: '🌍' },
      { id: 'business', name: 'Business', icon: '💼' },
      { id: 'technology', name: 'Technologie', icon: '💻' },
      { id: 'ai', name: 'Intelligence Artificielle', icon: '🤖' },
      { id: 'medicine', name: 'Médecine', icon: '🏥' },
      { id: 'travel', name: 'Voyage', icon: '✈️' },
      { id: 'food', name: 'Cuisine', icon: '🍳' },
      { id: 'sports', name: 'Sports', icon: '⚽' },
      { id: 'entertainment', name: 'Divertissement', icon: '🎬' },
      { id: 'science', name: 'Science', icon: '🔬' },
      { id: 'nature', name: 'Nature', icon: '🌿' },
      { id: 'politics', name: 'Politique', icon: '🏛️' },
    ];

    return reply.send(themes);
  });

  // ==========================================================================
  // GENERATE EXERCISE
  // ==========================================================================
  app.post('/generate', {
    preHandler: [authenticate, requireConsent],
    schema: {
      tags: ['exercises'],
      summary: 'Generate a new AI exercise',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const params = generateExerciseSchema.parse(request.body);
    const userId = request.userId!;

    // Check rate limit
    const rateLimit = await checkAIRateLimit(userId);
    if (!rateLimit.allowed) {
      return reply.status(429).send({
        error: true,
        message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
    }

    // Generate exercise via AI
    const result = await generateExercise(userId, params);

    if (result.error) {
      return reply.status(500).send({
        error: true,
        message: result.error,
      });
    }

    // Save exercise to database
    const exercise = await prisma.exercise.create({
      data: {
        type: params.type,
        level: params.level,
        theme: params.theme,
        title: result.data!.title,
        description: result.data!.description,
        content: result.data as object,
        promptVersion: '1.0',
        generatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EXERCISE_GENERATED',
        resource: 'exercise',
        resourceId: exercise.id,
        metadata: { type: params.type, level: params.level, theme: params.theme },
      },
    });

    return reply.send({
      exerciseId: exercise.id,
      ...result.data,
      cached: result.cached,
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetIn: rateLimit.resetIn,
      },
    });
  });

  // ==========================================================================
  // SUBMIT ANSWERS
  // ==========================================================================
  app.post('/submit', {
    preHandler: [authenticate],
    schema: {
      tags: ['exercises'],
      summary: 'Submit exercise answers',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { exerciseId, answers, timeSpent } = submitAnswerSchema.parse(request.body);
    const userId = request.userId!;

    // Get exercise
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return reply.status(404).send({
        error: true,
        message: 'Exercise not found',
      });
    }

    const content = exercise.content as {
      questions: {
        id: string;
        question: string;
        correctAnswer: string;
      }[];
    };

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredStyle: true, useFormal: true },
    });

    // Evaluate each answer
    const evaluations = [];
    let totalScore = 0;

    for (const answer of answers) {
      const question = content.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const evaluation = await evaluateAnswer(userId, {
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: answer.answer,
        style: user?.preferredStyle || 'ADAPTIVE',
        useFormal: user?.useFormal || false,
      });

      if (evaluation.data) {
        evaluations.push({
          questionId: answer.questionId,
          ...evaluation.data,
        });
        totalScore += evaluation.data.score;
      }
    }

    const maxScore = answers.length * 100;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Save result
    const result = await prisma.exerciseResult.create({
      data: {
        userId,
        exerciseId,
        score: totalScore,
        maxScore,
        percentage,
        timeSpent,
        answers: answers as object,
        feedback: evaluations as object,
        aiEvaluation: evaluations as object,
      },
    });

    // Update exercise stats
    await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        timesCompleted: { increment: 1 },
      },
    });

    // Update streak
    await recordActivity(userId);

    // Check for badges
    await checkExerciseBadges(userId);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EXERCISE_COMPLETED',
        resource: 'exercise',
        resourceId: exerciseId,
        metadata: { score: percentage, timeSpent },
      },
    });

    return reply.send({
      resultId: result.id,
      score: totalScore,
      maxScore,
      percentage,
      evaluations,
      passed: percentage >= 80,
    });
  });

  // ==========================================================================
  // GET EXERCISE HISTORY
  // ==========================================================================
  app.get('/history', {
    preHandler: [authenticate],
    schema: {
      tags: ['exercises'],
      summary: 'Get exercise history',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const userId = request.userId!;

    const [results, total] = await Promise.all([
      prisma.exerciseResult.findMany({
        where: { userId },
        include: {
          exercise: {
            select: {
              title: true,
              type: true,
              level: true,
              theme: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.exerciseResult.count({ where: { userId } }),
    ]);

    return reply.send({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // ==========================================================================
  // GET SPECIFIC EXERCISE
  // ==========================================================================
  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: ['exercises'],
      summary: 'Get exercise by ID',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return reply.status(404).send({
        error: true,
        message: 'Exercise not found',
      });
    }

    return reply.send(exercise);
  });

  // ==========================================================================
  // GET EXERCISE RESULT
  // ==========================================================================
  app.get('/result/:id', {
    preHandler: [authenticate],
    schema: {
      tags: ['exercises'],
      summary: 'Get exercise result',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await prisma.exerciseResult.findUnique({
      where: { id },
      include: {
        exercise: true,
      },
    });

    if (!result || result.userId !== request.userId) {
      return reply.status(404).send({
        error: true,
        message: 'Result not found',
      });
    }

    return reply.send(result);
  });
};

// Helper to record daily activity
async function recordActivity(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        activeDates: [today.toISOString()],
      },
    });
    return;
  }

  const lastActive = new Date(streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return; // Already recorded today

  let newStreak = streak.currentStreak;
  let activeDates = streak.activeDates as string[];

  if (diffDays === 1) {
    newStreak++;
    activeDates.push(today.toISOString());
  } else {
    newStreak = 1;
    activeDates = [today.toISOString()];
  }

  if (activeDates.length > 365) {
    activeDates = activeDates.slice(-365);
  }

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActiveDate: today,
      activeDates,
    },
  });
}

// Helper to check exercise-based badges
async function checkExerciseBadges(userId: string): Promise<void> {
  const count = await prisma.exerciseResult.count({ where: { userId } });

  const exerciseBadges = [
    { code: 'EXERCISES_10', minCount: 10 },
    { code: 'EXERCISES_50', minCount: 50 },
    { code: 'EXERCISES_100', minCount: 100 },
    { code: 'EXERCISES_500', minCount: 500 },
  ];

  for (const eb of exerciseBadges) {
    if (count >= eb.minCount) {
      const badge = await prisma.badge.findUnique({
        where: { code: eb.code },
      });

      if (badge) {
        await prisma.userBadge.upsert({
          where: {
            userId_badgeId: { userId, badgeId: badge.id },
          },
          create: { userId, badgeId: badge.id },
          update: {},
        });
      }
    }
  }
}
