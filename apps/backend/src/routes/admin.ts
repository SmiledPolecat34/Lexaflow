import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { requireAdmin, requireModerator } from '../middleware/auth.js';
import {
  paginationSchema,
  updateUserRoleSchema,
  createExerciseSchema,
  updatePromptSchema,
} from '../schemas/index.js';

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ==========================================================================
  // USERS MANAGEMENT
  // ==========================================================================
  app.get('/users', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'List all users',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { page, limit, sortBy, sortOrder } = paginationSchema.parse(request.query);
    const { search, role, level } = request.query as {
      search?: string;
      role?: string;
      level?: string;
    };

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role: role as any }),
      ...(level && { level: level as any }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          level: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { exerciseResults: true, badges: true },
          },
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return reply.send({
      data: users.map((u) => ({
        ...u,
        exerciseCount: u._count.exerciseResults,
        badgeCount: u._count.badges,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  app.get('/users/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Get user details',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            exerciseResults: true,
            courseProgress: true,
            badges: true,
          },
        },
        streaks: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: true, message: 'User not found' });
    }

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return reply.send(safeUser);
  });

  app.patch('/users/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Update user',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as {
      role?: string;
      isActive?: boolean;
      level?: string;
    };

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.level && { level: data.level as any }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        level: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: 'ADMIN_UPDATE_USER',
        resource: 'user',
        resourceId: id,
        metadata: { changes: data },
      },
    });

    return reply.send(user);
  });

  app.delete('/users/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Delete user',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Prevent self-deletion
    if (id === request.userId) {
      return reply.status(400).send({
        error: true,
        message: 'Cannot delete your own account',
      });
    }

    await prisma.user.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: 'ADMIN_DELETE_USER',
        resource: 'user',
        resourceId: id,
      },
    });

    return reply.send({ message: 'User deleted successfully' });
  });

  // ==========================================================================
  // EXERCISES MANAGEMENT
  // ==========================================================================
  app.get('/exercises', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'List all exercises',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const { type, level } = request.query as { type?: string; level?: string };

    const where = {
      ...(type && { type: type as any }),
      ...(level && { level: level as any }),
    };

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.exercise.count({ where }),
    ]);

    return reply.send({
      data: exercises,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  app.post('/exercises', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'Create exercise',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const data = createExerciseSchema.parse(request.body);

    const exercise = await prisma.exercise.create({
      data: {
        ...data,
        content: data.content as object,
      },
    });

    return reply.status(201).send(exercise);
  });

  app.patch('/exercises/:id', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'Update exercise',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: data as any,
    });

    return reply.send(exercise);
  });

  app.delete('/exercises/:id', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'Delete exercise',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.exercise.delete({ where: { id } });
    return reply.send({ message: 'Exercise deleted' });
  });

  // ==========================================================================
  // COURSES MANAGEMENT
  // ==========================================================================
  app.get('/courses', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'List all courses (including unpublished)',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { lessons: true, progress: true } },
      },
      orderBy: { order: 'asc' },
    });

    return reply.send(
      courses.map((c) => ({
        ...c,
        lessonCount: c._count.lessons,
        enrolledCount: c._count.progress,
      }))
    );
  });

  app.post('/courses', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'Create course',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const data = request.body as any;

    const course = await prisma.course.create({
      data: {
        type: data.type,
        level: data.level,
        title: data.title,
        description: data.description,
        content: data.content || {},
        duration: data.duration,
        order: data.order || 0,
        isPublished: data.isPublished || false,
      },
    });

    return reply.status(201).send(course);
  });

  app.patch('/courses/:id', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'Update course',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;

    const course = await prisma.course.update({
      where: { id },
      data: data as any,
    });

    return reply.send(course);
  });

  // ==========================================================================
  // AI PROMPTS MANAGEMENT
  // ==========================================================================
  app.get('/prompts', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'List AI prompts',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const prompts = await prisma.aIPrompt.findMany({
      orderBy: { name: 'asc' },
    });
    return reply.send(prompts);
  });

  app.post('/prompts', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Create AI prompt',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const data = updatePromptSchema.parse(request.body);

    const prompt = await prisma.aIPrompt.create({ data });
    return reply.status(201).send(prompt);
  });

  app.patch('/prompts/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Update AI prompt',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;

    // Increment version on update
    const current = await prisma.aIPrompt.findUnique({ where: { id } });

    const prompt = await prisma.aIPrompt.update({
      where: { id },
      data: {
        ...data,
        version: (current?.version || 0) + 1,
      },
    });

    return reply.send(prompt);
  });

  // ==========================================================================
  // ACTIVITY LOGS
  // ==========================================================================
  app.get('/logs', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Get activity logs',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const { action, userId } = request.query as {
      action?: string;
      userId?: string;
    };

    const where = {
      ...(action && { action }),
      ...(userId && { userId }),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return reply.send({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  // ==========================================================================
  // BADGES MANAGEMENT
  // ==========================================================================
  app.get('/badges', {
    preHandler: [requireModerator],
    schema: {
      tags: ['admin'],
      summary: 'List all badges',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const badges = await prisma.badge.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });

    return reply.send(
      badges.map((b) => ({
        ...b,
        earnedCount: b._count.users,
      }))
    );
  });

  app.post('/badges', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Create badge',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const data = request.body as any;

    const badge = await prisma.badge.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        iconUrl: data.iconUrl,
        conditions: data.conditions || {},
        rarity: data.rarity || 'COMMON',
        points: data.points || 10,
      },
    });

    return reply.status(201).send(badge);
  });

  // ==========================================================================
  // STATISTICS
  // ==========================================================================
  app.get('/stats', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['admin'],
      summary: 'Get platform statistics',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const [
      totalUsers,
      activeUsers,
      totalExercises,
      totalCourses,
      exercisesCompleted,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.exercise.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.exerciseResult.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // User distribution by level
    const levelDistribution = await prisma.user.groupBy({
      by: ['level'],
      _count: true,
    });

    // Exercise completion by type
    const exercisesByType = await prisma.exerciseResult.groupBy({
      by: ['exerciseId'],
      _count: true,
      _avg: { percentage: true },
    });

    return reply.send({
      users: {
        total: totalUsers,
        active: activeUsers,
        recentSignups,
      },
      content: {
        exercises: totalExercises,
        courses: totalCourses,
        exercisesCompleted,
      },
      levelDistribution: levelDistribution.reduce(
        (acc, item) => {
          acc[item.level] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    });
  });
};
