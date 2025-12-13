const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get access token from localStorage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Set tokens in localStorage
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Clear tokens
export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Get refresh token
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  clearTokens();
  return false;
}

// Main API request function
export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  const accessToken = getAccessToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    let response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // If 401, try to refresh token
    if (response.status === 401 && accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getAccessToken();
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
      } else {
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return { error: 'Session expired' };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error' };
  }
}

// =============================================================================
// AUTH API
// =============================================================================

export interface LoginParams {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  level: string;
  role: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

export const authApi = {
  login: (params: LoginParams) =>
    api<AuthResponse>('/api/auth/login', { method: 'POST', body: params }),

  register: (params: RegisterParams) =>
    api<AuthResponse>('/api/auth/register', { method: 'POST', body: params }),

  logout: () => api('/api/auth/logout', { method: 'POST' }),

  getMe: () => api<User>('/api/users/me'),

  forgotPassword: (email: string) =>
    api('/api/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, password: string) =>
    api('/api/auth/reset-password', { method: 'POST', body: { token, password } }),

  setup2FA: () => api<{ secret: string; qrCode: string }>('/api/auth/2fa/setup', { method: 'POST' }),

  verify2FA: (totpCode: string) =>
    api<{ recoveryCodes: string[] }>('/api/auth/2fa/verify', { method: 'POST', body: { totpCode } }),

  disable2FA: (totpCode: string) =>
    api('/api/auth/2fa/disable', { method: 'POST', body: { totpCode } }),
};

// =============================================================================
// EXERCISES API
// =============================================================================

export interface Exercise {
  id: string;
  type: string;
  level: string;
  theme: string;
  title: string;
  description: string;
  content: {
    questions: ExerciseQuestion[];
  };
}

export interface ExerciseQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GenerateExerciseParams {
  type: string;
  level: string;
  theme: string;
  style?: string;
  useFormal?: boolean;
  count?: number;
}

export interface ExerciseResult {
  resultId: string;
  score: number;
  maxScore: number;
  percentage: number;
  evaluations: {
    questionId: string;
    isCorrect: boolean;
    score: number;
    feedback: string;
    explanation: string;
  }[];
  passed: boolean;
}

export const exercisesApi = {
  getTypes: () => api<{ id: string; name: string; icon: string }[]>('/api/exercises/types'),

  getLevels: () => api<{ id: string; name: string }[]>('/api/exercises/levels'),

  getThemes: () => api<{ id: string; name: string; icon: string }[]>('/api/exercises/themes'),

  generate: (params: GenerateExerciseParams) =>
    api<Exercise & { exerciseId: string }>('/api/exercises/generate', {
      method: 'POST',
      body: params,
    }),

  submit: (exerciseId: string, answers: { questionId: string; answer: string }[], timeSpent: number) =>
    api<ExerciseResult>('/api/exercises/submit', {
      method: 'POST',
      body: { exerciseId, answers, timeSpent },
    }),

  getHistory: (page = 1, limit = 20) =>
    api<{ data: ExerciseResult[]; pagination: Pagination }>(`/api/exercises/history?page=${page}&limit=${limit}`),
};

// =============================================================================
// COURSES API
// =============================================================================

export interface Course {
  id: string;
  type: string;
  level: string;
  title: string;
  description: string;
  duration: number;
  lessonCount: number;
}

export interface CourseProgress {
  progressPercent: number;
  completedLessons: string[];
  currentLesson?: string;
}

export const coursesApi = {
  getAll: (type?: string, level?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (level) params.append('level', level);
    return api<Course[]>(`/api/courses?${params}`);
  },

  getById: (id: string) => api<Course>(`/api/courses/${id}`),

  getProgress: (id: string) => api<CourseProgress>(`/api/courses/${id}/progress`),

  updateProgress: (id: string, lessonId: string, completed: boolean) =>
    api<CourseProgress>(`/api/courses/${id}/progress`, {
      method: 'POST',
      body: { lessonId, completed },
    }),

  getRecommendations: () =>
    api<{ recommendations: Course[]; weakAreas: { type: string; avgScore: number }[] }>(
      '/api/courses/recommendations'
    ),

  getPlacementTest: () =>
    api<{ questions: ExerciseQuestion[]; totalQuestions: number }>('/api/courses/placement-test'),

  submitPlacementTest: (answers: { questionId: string; answer: string }[], questions: ExerciseQuestion[]) =>
    api<{ level: string; score: number; passed: boolean }>('/api/courses/placement-test', {
      method: 'POST',
      body: { answers, questions },
    }),
};

// =============================================================================
// USER API
// =============================================================================

export interface UserProgress {
  summary: {
    totalExercises: number;
    averageScore: number;
    coursesInProgress: number;
    coursesCompleted: number;
    badgesEarned: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  rarity: string;
  points: number;
  earnedAt?: string;
}

export const userApi = {
  getProgress: () => api<UserProgress>('/api/users/progress'),

  updatePreferences: (data: { level?: string; preferredStyle?: string; useFormal?: boolean }) =>
    api('/api/users/me', { method: 'PATCH', body: data }),

  getBadges: () => api<{ earned: Badge[]; available: Badge[] }>('/api/users/badges'),

  getStreak: () =>
    api<{ currentStreak: number; longestStreak: number; activeDates: string[] }>('/api/users/streak'),

  recordActivity: () => api('/api/users/streak/activity', { method: 'POST' }),

  exportData: () => api('/api/users/export'),

  deleteAccount: (password: string) =>
    api('/api/users/me', { method: 'DELETE', body: { password, confirmation: 'DELETE MY ACCOUNT' } }),
};

// =============================================================================
// TYPES
// =============================================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
