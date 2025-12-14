'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import {
  exercisesApi,
  type GenerateExerciseParams,
  type Exercise,
  type ExerciseResult,
  type Pagination,
} from '@/lib/api';

// =============================================================================
// TYPES
// =============================================================================

export type ExerciseType = {
  id: string;
  name: string;
  icon: string;
};

export type ExerciseLevel = {
  id: string;
  name: string;
};

export type ExerciseTheme = {
  id: string;
  name: string;
  icon: string;
};

export type GeneratedExercise = Exercise & { exerciseId: string };

export type ExerciseHistoryResponse = {
  data: ExerciseResult[];
  pagination: Pagination;
};

export type SubmitExerciseParams = {
  exerciseId: string;
  answers: { questionId: string; answer: string }[];
  timeSpent: number;
};

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

export function useExerciseTypes(): UseQueryResult<ExerciseType[], Error> {
  return useQuery<ExerciseType[], Error>({
    queryKey: exerciseKeys.types(),
    queryFn: async (): Promise<ExerciseType[]> => {
      const { data, error } = await exercisesApi.getTypes();
      if (error) throw new Error(error);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useExerciseLevels(): UseQueryResult<ExerciseLevel[], Error> {
  return useQuery<ExerciseLevel[], Error>({
    queryKey: exerciseKeys.levels(),
    queryFn: async (): Promise<ExerciseLevel[]> => {
      const { data, error } = await exercisesApi.getLevels();
      if (error) throw new Error(error);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useExerciseThemes(): UseQueryResult<ExerciseTheme[], Error> {
  return useQuery<ExerciseTheme[], Error>({
    queryKey: exerciseKeys.themes(),
    queryFn: async (): Promise<ExerciseTheme[]> => {
      const { data, error } = await exercisesApi.getThemes();
      if (error) throw new Error(error);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useGenerateExercise(): UseMutationResult<
  GeneratedExercise,
  Error,
  GenerateExerciseParams,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation<GeneratedExercise, Error, GenerateExerciseParams, unknown>({
    mutationFn: async (params: GenerateExerciseParams): Promise<GeneratedExercise> => {
      const { data, error } = await exercisesApi.generate(params);
      if (error) throw new Error(error);
      if (!data) throw new Error('No exercise data returned');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.history(1) });
    },
  });
}

export function useSubmitExercise(): UseMutationResult<
  ExerciseResult,
  Error,
  SubmitExerciseParams,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation<ExerciseResult, Error, SubmitExerciseParams, unknown>({
    mutationFn: async (params: SubmitExerciseParams): Promise<ExerciseResult> => {
      const { data, error } = await exercisesApi.submit(
        params.exerciseId,
        params.answers,
        params.timeSpent
      );
      if (error) throw new Error(error);
      if (!data) throw new Error('No result data returned');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exerciseKeys.history(1) });
    },
  });
}

export function useExerciseHistory(
  page = 1
): UseQueryResult<ExerciseHistoryResponse, Error> {
  return useQuery<ExerciseHistoryResponse, Error>({
    queryKey: exerciseKeys.history(page),
    queryFn: async (): Promise<ExerciseHistoryResponse> => {
      const { data, error } = await exercisesApi.getHistory(page);
      if (error) throw new Error(error);
      if (!data) throw new Error('No history data returned');
      return data;
    },
  });
}
