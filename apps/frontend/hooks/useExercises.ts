'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exercisesApi, type GenerateExerciseParams } from '@/lib/api';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const exerciseKeys = {
  all: ['exercises'] as const,
  types: () => [...exerciseKeys.all, 'types'] as const,
  levels: () => [...exerciseKeys.all, 'levels'] as const,
  themes: () => [...exerciseKeys.all, 'themes'] as const,
  history: (page: number) => [...exerciseKeys.all, 'history', page] as const,
};

// =============================================================================
// HOOKS
// =============================================================================

export function useExerciseTypes() {
  return useQuery({
    queryKey: exerciseKeys.types(),
    queryFn: async () => {
      const { data, error } = await exercisesApi.getTypes();
      if (error) throw new Error(error);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useExerciseLevels() {
  return useQuery({
    queryKey: exerciseKeys.levels(),
    queryFn: async () => {
      const { data, error } = await exercisesApi.getLevels();
      if (error) throw new Error(error);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useExerciseThemes() {
  return useQuery({
    queryKey: exerciseKeys.themes(),
    queryFn: async () => {
      const { data, error } = await exercisesApi.getThemes();
      if (error) throw new Error(error);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useGenerateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateExerciseParams) => {
      const { data, error } = await exercisesApi.generate(params);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.history(1) });
    },
  });
}

export function useSubmitExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      answers,
      timeSpent,
    }: {
      exerciseId: string;
      answers: { questionId: string; answer: string }[];
      timeSpent: number;
    }) => {
      const { data, error } = await exercisesApi.submit(exerciseId, answers, timeSpent);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.history(1) });
    },
  });
}

export function useExerciseHistory(page = 1) {
  return useQuery({
    queryKey: exerciseKeys.history(page),
    queryFn: async () => {
      const { data, error } = await exercisesApi.getHistory(page);
      if (error) throw new Error(error);
      return data;
    },
  });
}
