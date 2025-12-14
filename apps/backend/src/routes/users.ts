import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { updateUserSchema } from '../schemas/index.js';


export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ==========================================================================
  // GET CURRENT USER
  // ==========================================================================
  app.get('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        level: true,
        preferredStyle: true,
        useFormal: true,
        role: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        consentGiven: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            exerciseResults: true,
            badges: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: true,
        message: 'User not found',
      });
    }

    // Get streak info
    const streak = await prisma.streak.findUnique({
      where: { userId: request.userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    return reply.send({
      ...user,
      exerciseCount: user._count.exerciseResults,
      badgeCount: user._count.badges,
      streak: streak || { currentStreak: 0, longestStreak: 0 },
    });
  });

  // ==========================================================================
  // UPDATE USER PREFERENCES
  // ==========================================================================
  app.patch('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Update user preferences',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const data = updateUserSchema.parse(request.body);

    const user = await prisma.user.update({
      where: { id: request.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        level: true,
        preferredStyle: true,
        useFormal: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: 'UPDATE_PROFILE',
        resource: 'user',
        resourceId: request.userId,
        metadata: { updatedFields: Object.keys(data) },
      },
    });

    return reply.send(user);
  });

  // ==========================================================================
  // GET USER PROGRESS
  // ==========================================================================
  app.get('/progress', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Get user learning progress',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const userId = request.userId!;


    // Get results by type
    const resultsByType = await prisma.exerciseResult.findMany({
      where: { userId },
      include: {
        exercise: {
          select: { type: true, level: true },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 100,
    });

    // Calculate stats by type
    const typeStats: Record<string, { count: number; avgScore: number }> = {};
    for (const result of resultsByType) {
      const type = result.exercise.type;
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, avgScore: 0 };
      }
      typeStats[type].count++;
      typeStats[type].avgScore += result.percentage;
    }
    for (const type of Object.keys(typeStats)) {
      typeStats[type]!.avgScore /= typeStats[type]!.count;
    }

    // Get course progress
    const courseProgress = await prisma.courseProgress.findMany({
      where: { userId },
      include: {
        course: {
          select: { title: true, type: true, level: true },
        },
      },
    });

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get streak
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    return reply.send({
      summary: {
        totalExercises: resultsByType.length,
        averageScore:
          resultsByType.reduce((sum, r) => sum + r.percentage, 0) /
          resultsByType.length || 0,
        coursesInProgress: courseProgress.filter((c) => !c.completedAt).length,
        coursesCompleted: courseProgress.filter((c) => c.completedAt).length,
        badgesEarned: badges.length,
      },
      exercisesByType: typeStats,
      recentResults: resultsByType.slice(0, 10).map((r) => ({
        exerciseType: r.exercise.type,
        level: r.exercise.level,
        score: r.percentage,
        completedAt: r.completedAt,
      })),
      courses: courseProgress.map((cp) => ({
        ...cp.course,
        progress: cp.progressPercent,
        completed: !!cp.completedAt,
      })),
      badges: badges.map((ub) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      streak,
    });
  });

  // ==========================================================================
  // UPDATE CONSENT (GDPR)
  // ==========================================================================
  app.post('/consent', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Update GDPR consent',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { consent } = request.body as { consent: boolean };

    await prisma.user.update({
      where: { id: request.userId },
      data: {
        consentGiven: consent,
        consentDate: consent ? new Date() : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: consent ? 'CONSENT_GIVEN' : 'CONSENT_REVOKED',
        resource: 'user',
        resourceId: request.userId,
      },
    });

    return reply.send({
      message: consent ? 'Consent recorded' : 'Consent revoked',
    });
  });

  // ==========================================================================
  // EXPORT USER DATA (GDPR)
  // ==========================================================================
  app.get('/export', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Export all user data (GDPR)',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const userId = request.userId!;

    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        exerciseResults: {
          include: {
            exercise: {
              select: { title: true, type: true, level: true },
            },
          },
        },
        courseProgress: {
          include: {
            course: {
              select: { title: true, type: true },
            },
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
        streaks: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1000,
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: true,
        message: 'User not found',
      });
    }

    // Remove sensitive data
    const { passwordHash: _passwordHash, twoFactorSecret: _twoFactorSecret, ...safeUser } = user;
    void _passwordHash; void _twoFactorSecret; // Used for exclusion from response

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        ...safeUser,
        passwordHash: '[REDACTED]',
        twoFactorSecret: user.twoFactorEnabled ? '[ENABLED]' : null,
      },
    };

    // Update export timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { dataExportedAt: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DATA_EXPORT',
        resource: 'user',
        resourceId: userId,
      },
    });

    // Return as JSON (could also create ZIP)
    return reply
      .header('Content-Type', 'application/json')
      .header(
        'Content-Disposition',
        `attachment; filename="lexaflow-export-${userId}.json"`
      )
      .send(exportData);
  });

  // ==========================================================================
  // DELETE USER ACCOUNT (GDPR)
  // ==========================================================================
  app.delete('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Delete user account (GDPR)',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { password, confirmation } = request.body as {
      password: string;
      confirmation: string;
    };

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return reply.status(400).send({
        error: true,
        message: 'Please type "DELETE MY ACCOUNT" to confirm',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return reply.status(400).send({
        error: true,
        message: 'Cannot delete OAuth-only account this way',
      });
    }

    // Verify password
    const isValid = await import('../utils/security.js').then((m) =>
      m.verifyPassword(password, user.passwordHash!)
    );

    if (!isValid) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid password',
      });
    }

    // Log before deletion
    await prisma.activityLog.create({
      data: {
        action: 'ACCOUNT_DELETED',
        resource: 'user',
        resourceId: request.userId,
        metadata: { deletedAt: new Date().toISOString() },
      },
    });

    // Delete user (cascades to related data)
    await prisma.user.delete({
      where: { id: request.userId },
    });

    return reply.send({
      message: 'Account deleted successfully',
    });
  });

  // ==========================================================================
  // GET USER BADGES
  // ==========================================================================
  app.get('/badges', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Get user badges',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const badges = await prisma.userBadge.findMany({
      where: { userId: request.userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get all available badges for comparison
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    const earnedIds = new Set(badges.map((b) => b.badgeId));

    return reply.send({
      earned: badges.map((b) => ({
        ...b.badge,
        earnedAt: b.earnedAt,
      })),
      available: allBadges.filter((b) => !earnedIds.has(b.id)),
    });
  });

  // ==========================================================================
  // GET USER STREAK
  // ==========================================================================
  app.get('/streak', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Get user streak data',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    let streak = await prisma.streak.findUnique({
      where: { userId: request.userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId: request.userId!,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date(),
          activeDates: [],
        },
      });
    }

    return reply.send(streak);
  });

  // ==========================================================================
  // UPDATE STREAK
  // ==========================================================================
  app.post('/streak/activity', {
    preHandler: [authenticate],
    schema: {
      tags: ['users'],
      summary: 'Record daily activity for streak',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const userId = request.userId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          activeDates: [today.toISOString()],
        },
      });
      return reply.send(streak);
    }

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = streak.currentStreak;
    let activeDates = streak.activeDates as string[];

    if (diffDays === 0) {
      // Already recorded today
      return reply.send(streak);
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak++;
      activeDates.push(today.toISOString());
    } else {
      // Streak broken
      newStreak = 1;
      activeDates = [today.toISOString()];
    }

    // Keep only last 365 days
    if (activeDates.length > 365) {
      activeDates = activeDates.slice(-365);
    }

    streak = await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(streak.longestStreak, newStreak),
        lastActiveDate: today,
        activeDates,
      },
    });

    // Check for streak badges
    await checkStreakBadges(userId, newStreak);

    return reply.send(streak);
  });
};

// Helper function to check and award streak badges
async function checkStreakBadges(userId: string, streak: number): Promise<void> {
  const streakBadges = [
    { code: 'STREAK_7', minStreak: 7 },
    { code: 'STREAK_30', minStreak: 30 },
    { code: 'STREAK_100', minStreak: 100 },
    { code: 'STREAK_365', minStreak: 365 },
  ];

  for (const sb of streakBadges) {
    if (streak >= sb.minStreak) {
      const badge = await prisma.badge.findUnique({
        where: { code: sb.code },
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
