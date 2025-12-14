import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/database.js';
import { Role } from '@prisma/client';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    userRole?: Role;
  }
}

interface JWTPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware - requires valid JWT
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: true,
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);
    const decoded = request.server.jwt.verify<JWTPayload>(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({
        error: true,
        message: 'User not found or inactive',
      });
    }

    request.userId = user.id;
    request.userRole = user.role;
  } catch (error) {
    return reply.status(401).send({
      error: true,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication - attaches user if token present
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = request.server.jwt.verify<JWTPayload>(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, role: true, isActive: true },
      });

      if (user && user.isActive) {
        request.userId = user.id;
        request.userRole = user.role;
      }
    }
  } catch {
    // Ignore errors - auth is optional
  }
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);

  if (reply.sent) return;

  if (request.userRole !== 'ADMIN') {
    return reply.status(403).send({
      error: true,
      message: 'Admin access required',
    });
  }
}

/**
 * Require admin or moderator role
 */
export async function requireModerator(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);

  if (reply.sent) return;

  if (request.userRole !== 'ADMIN' && request.userRole !== 'MODERATOR') {
    return reply.status(403).send({
      error: true,
      message: 'Moderator access required',
    });
  }
}

/**
 * Require email verification
 */
export async function requireVerifiedEmail(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);

  if (reply.sent) return;

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { isEmailVerified: true },
  });

  if (!user?.isEmailVerified) {
    return reply.status(403).send({
      error: true,
      message: 'Email verification required',
    });
  }
}

/**
 * Require GDPR consent
 */
export async function requireConsent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);

  if (reply.sent) return;

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { consentGiven: true },
  });

  if (!user?.consentGiven) {
    return reply.status(403).send({
      error: true,
      message: 'GDPR consent required',
    });
  }
}
