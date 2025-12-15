import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Sentry } from './instrument.js';

import { env, isDev } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Import routes
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { exerciseRoutes } from './routes/exercises.js';
import { courseRoutes } from './routes/courses.js';
import { adminRoutes } from './routes/admin.js';
import { healthRoutes } from './routes/health.js';
import { getRateLimitRedis } from './config/redis-rate-limit';



export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: isDev ? 'debug' : 'info',
      transport: isDev
        ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
        : undefined,
    },
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: isDev ? false : undefined,
  });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    redis: getRateLimitRedis() ?? undefined,
  });

  // JWT
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  });

  // Cookies
  await app.register(cookie, {
    secret: env.JWT_SECRET,
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      security: [{ bearerAuth: [] }],
      info: {
        title: 'LexaFlow API',
        description: 'API for LexaFlow English Learning Application',
        version: '1.0.0',
      },
      servers: [
        { url: env.BACKEND_URL, description: 'Current server' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management' },
        { name: 'exercises', description: 'Exercise endpoints' },
        { name: 'courses', description: 'Course endpoints' },
        { name: 'admin', description: 'Admin endpoints' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });


  // Register routes
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(exerciseRoutes, { prefix: '/api/exercises' });
  await app.register(courseRoutes, { prefix: '/api/courses' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    if (Sentry) {
      Sentry.captureException(error, {
        extra: {
          url: request.url,
          method: request.method,
          reqId: request.id,
        },
      });
    }

    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = isDev ? error.message : 'Internal Server Error';

    reply.status(statusCode).send({
      error: true,
      message,
      statusCode,
      ...(isDev && { stack: error.stack }),
    });
  });


  return app;
}

async function start(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Build and start app
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    console.log(`📚 API docs at http://localhost:${env.PORT}/docs`);

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down...`);
        await app.close();
        await disconnectDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
