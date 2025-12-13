import { z } from 'zod';

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().length(6).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const verify2FASchema = z.object({
  totpCode: z.string().length(6, 'TOTP code must be 6 digits'),
});

export const recoveryCodeSchema = z.object({
  recoveryCode: z.string().min(1, 'Recovery code is required'),
});

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  preferredStyle: z.enum(['SHORT', 'DETAILED', 'ADAPTIVE']).optional(),
  useFormal: z.boolean().optional(),
});

export const consentSchema = z.object({
  consent: z.boolean(),
});

// =============================================================================
// EXERCISE SCHEMAS
// =============================================================================

export const exerciseTypesEnum = z.enum([
  'INFINITIVE_VERBS',
  'CONJUGATION',
  'VOCABULARY',
  'GRAMMAR',
  'READING',
  'LISTENING',
  'TRANSLATION',
  'FILL_BLANK',
  'MULTIPLE_CHOICE',
  'MATCHING',
]);

export const levelEnum = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const responseStyleEnum = z.enum(['SHORT', 'DETAILED', 'ADAPTIVE']);

export const generateExerciseSchema = z.object({
  type: exerciseTypesEnum,
  level: levelEnum,
  theme: z.string().min(1).max(100),
  style: responseStyleEnum.default('ADAPTIVE'),
  useFormal: z.boolean().default(false),
  count: z.number().int().min(1).max(20).default(5),
});

export const submitAnswerSchema = z.object({
  exerciseId: z.string().cuid(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
  timeSpent: z.number().int().min(0),
});

// =============================================================================
// COURSE SCHEMAS
// =============================================================================

export const courseTypeEnum = z.enum([
  'GRAMMAR',
  'CONJUGATION',
  'VOCABULARY',
  'CONVERSATION',
]);

export const getCourseSchema = z.object({
  type: courseTypeEnum.optional(),
  level: levelEnum.optional(),
});

export const updateProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean(),
});

// =============================================================================
// PLACEMENT TEST SCHEMAS
// =============================================================================

export const placementTestAnswerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
  timeSpent: z.number().int().min(0),
});

// =============================================================================
// ADMIN SCHEMAS
// =============================================================================

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
});

export const createExerciseSchema = z.object({
  type: exerciseTypesEnum,
  level: levelEnum,
  theme: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.record(z.unknown()),
});

export const updatePromptSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  template: z.string().min(1),
  variables: z.array(z.string()),
  isActive: z.boolean().optional(),
});

// =============================================================================
// PAGINATION
// =============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type RecoveryCodeInput = z.infer<typeof recoveryCodeSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GenerateExerciseInput = z.infer<typeof generateExerciseSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type PlacementTestAnswerInput = z.infer<typeof placementTestAnswerSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
