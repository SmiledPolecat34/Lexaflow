import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateTOTPSecret,
  verifyTOTPCode,
  generateTOTPUri,
  generateRecoveryCodes,
  hashRecoveryCode,
  verifyRecoveryCode,
  parseDuration,
} from '../utils/security.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  recoveryCodeSchema,
} from '../schemas/index.js';
import { authenticate } from '../middleware/auth.js';
import { storeRefreshToken, invalidateRefreshToken, isRefreshTokenValid } from '../config/redis.js';
import { sendEmail } from '../services/email.js';
import QRCode from 'qrcode';

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ==========================================================================
  // REGISTER
  // ==========================================================================
  app.post('/register', {
    schema: {
      tags: ['auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
        required: ['email', 'password'],
      },
    },
  }, async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const { invitationCode } = request.body as { invitationCode?: string };

    // Validate invitation code
    if (!invitationCode || invitationCode !== env.INVITATION_CODE) {
      return reply.status(403).send({
        error: true,
        message: 'Code d\'invitation invalide ou manquant',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return reply.status(409).send({
        error: true,
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        level: true,
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = generateToken();
    await prisma.emailVerification.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify your LexaFlow account',
      html: `
        <h1>Welcome to LexaFlow!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${env.FRONTEND_URL}/verify-email?token=${verificationToken}">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    // Generate tokens
    const accessToken = app.jwt.sign(
      { sub: user.id, role: 'USER' },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = generateToken();
    const refreshExpiry = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiry),
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    });

    await storeRefreshToken(user.id, refreshToken, refreshExpiry / 1000);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        resource: 'user',
        resourceId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.status(201).send({
      user,
      accessToken,
      refreshToken,
    });
  });

  // ==========================================================================
  // LOGIN
  // ==========================================================================
  app.post('/login', {
    schema: {
      tags: ['auth'],
      summary: 'Login with email and password',
    },
  }, async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        level: true,
        isActive: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return reply.status(403).send({
        error: true,
        message: 'Account is disabled',
      });
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid email or password',
      });
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!body.totpCode) {
        return reply.status(200).send({
          requires2FA: true,
          message: 'Please provide your 2FA code',
        });
      }

      if (!user.twoFactorSecret || !verifyTOTPCode(user.twoFactorSecret, body.totpCode)) {
        return reply.status(401).send({
          error: true,
          message: 'Invalid 2FA code',
        });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = generateToken();
    const refreshExpiry = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiry),
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    });

    await storeRefreshToken(user.id, refreshToken, refreshExpiry / 1000);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'user',
        resourceId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    const { passwordHash: _ph, twoFactorSecret: _ts, ...userData } = user;
    void _ph; void _ts; // Used for exclusion from response

    return reply.send({
      user: userData,
      accessToken,
      refreshToken,
    });
  });

  // ==========================================================================
  // REFRESH TOKEN
  // ==========================================================================
  app.post('/refresh', {
    schema: {
      tags: ['auth'],
      summary: 'Refresh access token',
    },
  }, async (request, reply) => {
    const { refreshToken } = refreshTokenSchema.parse(request.body);

    // Find token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, role: true, isActive: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid or expired refresh token',
      });
    }

    if (!storedToken.user.isActive) {
      return reply.status(403).send({
        error: true,
        message: 'Account is disabled',
      });
    }

    // Verify in Redis cache
    const isValid = await isRefreshTokenValid(storedToken.userId, refreshToken);
    if (!isValid) {
      // Token may have been revoked
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      return reply.status(401).send({
        error: true,
        message: 'Refresh token has been revoked',
      });
    }

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
    await invalidateRefreshToken(storedToken.userId, refreshToken);

    // Create new tokens
    const accessToken = app.jwt.sign(
      { sub: storedToken.userId, role: storedToken.user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const newRefreshToken = generateToken();
    const refreshExpiry = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + refreshExpiry),
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    });

    await storeRefreshToken(storedToken.userId, newRefreshToken, refreshExpiry / 1000);

    return reply.send({
      accessToken,
      refreshToken: newRefreshToken,
    });
  });

  // ==========================================================================
  // LOGOUT
  // ==========================================================================
  app.post('/logout', {
    preHandler: [authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Logout and invalidate tokens',
    },
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string };

    if (refreshToken) {
      // Revoke specific token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId: request.userId },
        data: { revokedAt: new Date() },
      });
      await invalidateRefreshToken(request.userId!, refreshToken);
    } else {
      // Revoke all tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId: request.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: 'LOGOUT',
        resource: 'user',
        resourceId: request.userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.send({ message: 'Logged out successfully' });
  });

  // ==========================================================================
  // SETUP 2FA
  // ==========================================================================
  app.post('/2fa/setup', {
    preHandler: [authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Setup two-factor authentication',
    },
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return reply.status(404).send({
        error: true,
        message: 'User not found',
      });
    }

    if (user.twoFactorEnabled) {
      return reply.status(400).send({
        error: true,
        message: '2FA is already enabled',
      });
    }

    // Generate secret
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(user.email, secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(uri);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: request.userId },
      data: { twoFactorSecret: secret },
    });

    return reply.send({
      secret,
      qrCode,
      message: 'Scan the QR code with your authenticator app, then verify with a code',
    });
  });

  // ==========================================================================
  // VERIFY 2FA (ENABLE)
  // ==========================================================================
  app.post('/2fa/verify', {
    preHandler: [authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Verify and enable 2FA',
    },
  }, async (request, reply) => {
    const { totpCode } = verify2FASchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({
        error: true,
        message: 'Please setup 2FA first',
      });
    }

    if (user.twoFactorEnabled) {
      return reply.status(400).send({
        error: true,
        message: '2FA is already enabled',
      });
    }

    // Verify code
    if (!verifyTOTPCode(user.twoFactorSecret, totpCode)) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid verification code',
      });
    }

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();

    // Store hashed recovery codes
    await prisma.recoveryCode.createMany({
      data: recoveryCodes.map((code) => ({
        code: hashRecoveryCode(code),
        userId: request.userId!,
      })),
    });

    // Enable 2FA
    await prisma.user.update({
      where: { id: request.userId },
      data: { twoFactorEnabled: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: '2FA_ENABLED',
        resource: 'user',
        resourceId: request.userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.send({
      message: '2FA enabled successfully',
      recoveryCodes,
      warning: 'Save these recovery codes in a safe place. You will need them if you lose access to your authenticator app.',
    });
  });

  // ==========================================================================
  // DISABLE 2FA
  // ==========================================================================
  app.post('/2fa/disable', {
    preHandler: [authenticate],
    schema: {
      tags: ['auth'],
      summary: 'Disable 2FA',
    },
  }, async (request, reply) => {
    const { totpCode } = verify2FASchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return reply.status(400).send({
        error: true,
        message: '2FA is not enabled',
      });
    }

    // Verify code
    if (!verifyTOTPCode(user.twoFactorSecret, totpCode)) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid verification code',
      });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Delete recovery codes
    await prisma.recoveryCode.deleteMany({
      where: { userId: request.userId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: request.userId,
        action: '2FA_DISABLED',
        resource: 'user',
        resourceId: request.userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.send({ message: '2FA disabled successfully' });
  });

  // ==========================================================================
  // USE RECOVERY CODE
  // ==========================================================================
  app.post('/recovery', {
    schema: {
      tags: ['auth'],
      summary: 'Login with recovery code',
    },
  }, async (request, reply) => {
    const { email, password, recoveryCode } = {
      ...loginSchema.parse(request.body),
      ...recoveryCodeSchema.parse(request.body),
    };

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid credentials',
      });
    }

    // Find and verify recovery code
    const storedCodes = await prisma.recoveryCode.findMany({
      where: { userId: user.id, usedAt: null },
    });

    const validCode = storedCodes.find((c) => verifyRecoveryCode(recoveryCode, c.code));

    if (!validCode) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid recovery code',
      });
    }

    // Mark code as used
    await prisma.recoveryCode.update({
      where: { id: validCode.id },
      data: { usedAt: new Date() },
    });

    // Generate tokens
    const accessToken = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = generateToken();
    const refreshExpiry = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiry),
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    });

    await storeRefreshToken(user.id, refreshToken, refreshExpiry / 1000);

    // Count remaining recovery codes
    const remainingCodes = storedCodes.length - 1;

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'RECOVERY_CODE_USED',
        resource: 'user',
        resourceId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.send({
      accessToken,
      refreshToken,
      warning: `You have ${remainingCodes} recovery codes remaining. Consider generating new ones.`,
    });
  });

  // ==========================================================================
  // FORGOT PASSWORD
  // ==========================================================================
  app.post('/forgot-password', {
    schema: {
      tags: ['auth'],
      summary: 'Request password reset email',
    },
  }, async (request, reply) => {
    const { email } = forgotPasswordSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return reply.send({
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = generateToken();

    // Delete existing reset tokens
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Reset your LexaFlow password',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${env.FRONTEND_URL}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return reply.send({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  });

  // ==========================================================================
  // RESET PASSWORD
  // ==========================================================================
  app.post('/reset-password', {
    schema: {
      tags: ['auth'],
      summary: 'Reset password with token',
    },
  }, async (request, reply) => {
    const { token, password } = resetPasswordSchema.parse(request.body);

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return reply.status(400).send({
        error: true,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: resetToken.userId,
        action: 'PASSWORD_RESET',
        resource: 'user',
        resourceId: resetToken.userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.send({ message: 'Password reset successfully. Please login with your new password.' });
  });

  // ==========================================================================
  // VERIFY EMAIL
  // ==========================================================================
  app.get('/verify-email', {
    schema: {
      tags: ['auth'],
      summary: 'Verify email address',
    },
  }, async (request, reply) => {
    const { token } = request.query as { token: string };

    if (!token) {
      return reply.status(400).send({
        error: true,
        message: 'Verification token is required',
      });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, isEmailVerified: true } } },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return reply.status(400).send({
        error: true,
        message: 'Invalid or expired verification token',
      });
    }

    if (verification.user.isEmailVerified) {
      return reply.send({ message: 'Email is already verified' });
    }

    // Verify email
    await prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    });

    // Delete verification token
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return reply.send({ message: 'Email verified successfully' });
  });

  // ==========================================================================
  // GOOGLE OAUTH - INITIATE
  // ==========================================================================
  app.get('/google', {
    schema: {
      tags: ['auth'],
      summary: 'Initiate Google OAuth flow',
    },
  }, async (request, reply) => {
    const { invitationCode } = request.query as { invitationCode?: string };

    // Validate invitation code before redirecting to Google
    if (!invitationCode || invitationCode !== env.INVITATION_CODE) {
      return reply.redirect(`${env.FRONTEND_URL}/register?error=invalid_invitation_code`);
    }

    const clientId = env.GOOGLE_CLIENT_ID;
    const redirectUri = env.GOOGLE_CALLBACK_URL || `${env.BACKEND_URL}/api/auth/google/callback`;

    const scope = encodeURIComponent('email profile');
    const state = generateToken().substring(0, 32);

    // Store state and invitation code in cookies for CSRF protection and validation
    reply.setCookie('oauth_state', state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    reply.setCookie('oauth_invitation', invitationCode, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return reply.redirect(googleAuthUrl);
  });

  // ==========================================================================
  // GOOGLE OAUTH - CALLBACK
  // ==========================================================================
  app.get('/google/callback', {
    schema: {
      tags: ['auth'],
      summary: 'Handle Google OAuth callback',
    },
  }, async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };
    const storedState = request.cookies.oauth_state;
    const storedInvitationCode = request.cookies.oauth_invitation;

    // Clear the cookies
    reply.clearCookie('oauth_state', { path: '/' });
    reply.clearCookie('oauth_invitation', { path: '/' });

    // Verify state for CSRF protection
    if (!state || state !== storedState) {
      return reply.redirect(`${env.FRONTEND_URL}/register?error=invalid_state`);
    }

    // Verify invitation code
    if (!storedInvitationCode || storedInvitationCode !== env.INVITATION_CODE) {
      return reply.redirect(`${env.FRONTEND_URL}/register?error=invalid_invitation_code`);
    }

    if (!code) {
      return reply.redirect(`${env.FRONTEND_URL}/register?error=no_code`);
    }

    try {
      // Validate Google OAuth is configured
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        console.error('Google OAuth not configured');
        return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_not_configured`);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: env.GOOGLE_CALLBACK_URL || `${env.BACKEND_URL}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Google token error:', errorData);
        return reply.redirect(`${env.FRONTEND_URL}/login?error=token_exchange_failed`);
      }

      const tokens = await tokenResponse.json() as { access_token: string; id_token: string };

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        return reply.redirect(`${env.FRONTEND_URL}/login?error=user_info_failed`);
      }

      const googleUser = await userInfoResponse.json() as {
        id: string;
        email: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
      };

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email.toLowerCase() },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            firstName: googleUser.given_name || googleUser.name?.split(' ')[0],
            lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' '),
            googleId: googleUser.id,
            avatarUrl: googleUser.picture,
            isEmailVerified: true, // Google emails are verified
          },
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: user.avatarUrl || googleUser.picture,
            isEmailVerified: true,
          },
        });
      }

      if (!user.isActive) {
        return reply.redirect(`${env.FRONTEND_URL}/login?error=account_disabled`);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const accessToken = app.jwt.sign(
        { sub: user.id, role: user.role },
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
      );

      const refreshToken = generateToken();
      const refreshExpiry = parseDuration(env.JWT_REFRESH_EXPIRES_IN);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + refreshExpiry),
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        },
      });

      await storeRefreshToken(user.id, refreshToken, refreshExpiry / 1000);

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'GOOGLE_LOGIN',
          resource: 'user',
          resourceId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      // Redirect to frontend with tokens
      const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', accessToken);
      redirectUrl.searchParams.set('refreshToken', refreshToken);

      return reply.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Google OAuth error:', error);
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  });
};
