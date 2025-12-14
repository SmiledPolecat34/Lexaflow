'use client';

import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import {
  authApi,
  setTokens,
  clearTokens,
  type User,
  type LoginParams,
  type RegisterParams,
} from '@/lib/api';

// =============================================================================
// AUTH STORE
// =============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));

// =============================================================================
// AUTH HOOK
// =============================================================================

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const { data } = await authApi.getMe();
        if (data) {
          setUser(data);
        } else {
          clearTokens();
        }
      }
      useAuthStore.getState().setLoading(false);
    };

    initAuth();
  }, [setUser]);

  const login = useCallback(
    async (params: LoginParams) => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await authApi.login(params);

      if (error) {
        setError(error);
        setIsLoading(false);
        return { error };
      }

      if (data?.requires2FA) {
        setIsLoading(false);
        return { requires2FA: true };
      }

      if (data) {
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        router.push('/dashboard');
      }

      setIsLoading(false);
      return { data };
    },
    [router, setUser]
  );

  const register = useCallback(
    async (params: RegisterParams) => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await authApi.register(params);

      if (error) {
        setError(error);
        setIsLoading(false);
        return { error };
      }

      if (data) {
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        router.push('/dashboard');
      }

      setIsLoading(false);
      return { data };
    },
    [router, setUser]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    storeLogout();
    router.push('/');
  }, [router, storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}

// =============================================================================
// REQUIRE AUTH HOOK
// =============================================================================

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { user, isLoading };
}

// =============================================================================
// REQUIRE ADMIN HOOK
// =============================================================================

export function useRequireAdmin(redirectTo = '/dashboard') {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN') {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  return { user, isLoading, isAdmin: user?.role === 'ADMIN' };
}
