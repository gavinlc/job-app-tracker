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
export function useApplications(status: string | null = null, starredOnly: boolean = false, activeOnly: boolean = false) {
  return useQuery({
    queryKey: [...applicationKeys.list(status), starredOnly ? 'starred' : 'all', activeOnly ? 'active' : 'all'],
    queryFn: async () => {
      const result = await getAllApplicationsFn({ data: { status, starredOnly, activeOnly } })
      return result
    },
  });
}

// Search applications
export function useSearchApplications(query: string, enabled: boolean = true, starredOnly: boolean = false, activeOnly: boolean = false) {
  return useQuery({
    queryKey: [...applicationKeys.search(query), starredOnly ? 'starred' : 'all', activeOnly ? 'active' : 'all'],
    queryFn: async () => {
      const result = await searchApplicationsFn({ data: { query, starredOnly, activeOnly } })
      return result
    },
    enabled: enabled && query.trim().length > 0,
  });
}

// Get single application
export function useApplication(id: number | undefined) {
  return useQuery({
    queryKey: applicationKeys.detail(id!),
    queryFn: async () => {
      const result = await getApplicationByIdFn({ data: { id: id! } })
      return result
    },
    enabled: !!id,
  });
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: JobApplication) => {
      const result = await createApplicationFn({ data: { application } })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, application }: { id: number; application: JobApplication }) => {
      const result = await updateApplicationFn({ data: { id, application } })
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
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteApplicationFn({ data: { id } })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Toggle star status mutation
export function useToggleStarApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await toggleStarApplicationFn({ data: { id } })
      return result
    },
    onSuccess: (data, id) => {
      // Optimistically update the cache
      queryClient.setQueryData(applicationKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}



