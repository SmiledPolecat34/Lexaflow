import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';

export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/health', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
    },
  }, async (request, reply) => {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.services.database = 'healthy';
    } catch (error) {
      checks.services.database = 'unhealthy';
      checks.status = 'degraded';
    }

    // Check Redis
    try {
      const redis = getRedis();
      if (redis) {
        await redis.ping();
        checks.services.redis = 'healthy';
      } else {
        checks.services.redis = 'not configured';
      }
    } catch (error) {
      checks.services.redis = 'unhealthy';
      checks.status = 'degraded';
    }

    const statusCode = checks.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(checks);
  });

  app.get('/ready', {
    schema: {
      tags: ['health'],
      summary: 'Readiness check',
    },
  }, async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ ready: true });
    } catch (error) {
      return reply.status(503).send({ ready: false });
    }
  });

  app.get('/live', {
    schema: {
      tags: ['health'],
      summary: 'Liveness check',
    },
  }, async (request, reply) => {
    return reply.send({ live: true });
  });
};
