import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllApplicationsFn,
  getApplicationByIdFn,
  searchApplicationsFn,
  createApplicationFn,
  updateApplicationFn,
  deleteApplicationFn,
  toggleStarApplicationFn,
} from '../lib/server';
import { JobApplication } from '../types';

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (status: string | null) => [...applicationKeys.lists(), status] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: number) => [...applicationKeys.details(), id] as const,
  searches: () => [...applicationKeys.all, 'search'] as const,
  search: (query: string) => [...applicationKeys.searches(), query] as const,
};

// Get all applications (optionally filtered by status, starred, and active)
export function useApplications(userId: string | null, status: string | null = null, starredOnly: boolean = false, activeOnly: boolean = false) {
  return useQuery({
    queryKey: [...applicationKeys.list(status), starredOnly ? 'starred' : 'all', activeOnly ? 'active' : 'all', userId],
    queryFn: async () => {
      if (!userId) return []
      const result = await getAllApplicationsFn({ data: { status, starredOnly, activeOnly, userId } })
      return result
    },
    enabled: !!userId,
  });
}

// Search applications
export function useSearchApplications(query: string, enabled: boolean = true, starredOnly: boolean = false, activeOnly: boolean = false, userId: string | null = null) {
  return useQuery({
    queryKey: [...applicationKeys.search(query), starredOnly ? 'starred' : 'all', activeOnly ? 'active' : 'all', userId],
    queryFn: async () => {
      if (!userId) return []
      const result = await searchApplicationsFn({ data: { query, starredOnly, activeOnly, userId } })
      return result
    },
    enabled: enabled && query.trim().length > 0 && !!userId,
  });
}

// Get single application
export function useApplication(id: number | undefined, userId: string | null) {
  return useQuery({
    queryKey: [...applicationKeys.detail(id!), userId],
    queryFn: async () => {
      if (!userId || !id) return null
      const result = await getApplicationByIdFn({ data: { id, userId } })
      return result
    },
    enabled: !!id && !!userId,
  });
}

// Create application mutation
export function useCreateApplication(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: JobApplication) => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const result = await createApplicationFn({ data: { application, userId } })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Update application mutation
export function useUpdateApplication(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, application }: { id: number; application: JobApplication }) => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const result = await updateApplicationFn({ data: { id, application, userId } })
      return result
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(applicationKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Delete application mutation
export function useDeleteApplication(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const result = await deleteApplicationFn({ data: { id, userId } })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Toggle star status mutation
export function useToggleStarApplication(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const result = await toggleStarApplicationFn({ data: { id, userId } })
      return result
    },
    onSuccess: (data, id) => {
      // Optimistically update the cache
      queryClient.setQueryData(applicationKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}



