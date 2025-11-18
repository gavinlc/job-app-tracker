import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/client';
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

// Get all applications (optionally filtered by status)
export function useApplications(status: string | null = null) {
  return useQuery({
    queryKey: applicationKeys.list(status),
    queryFn: () => applicationsApi.getAll(status),
  });
}

// Search applications
export function useSearchApplications(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: applicationKeys.search(query),
    queryFn: () => applicationsApi.search(query),
    enabled: enabled && query.trim().length > 0,
  });
}

// Get single application
export function useApplication(id: number | undefined) {
  return useQuery({
    queryKey: applicationKeys.detail(id!),
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
  });
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: JobApplication) => applicationsApi.create(application),
    onSuccess: () => {
      // Invalidate and refetch applications lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, application }: { id: number; application: JobApplication }) =>
      applicationsApi.update(id, application),
    onSuccess: (data, variables) => {
      // Update the specific application in cache
      queryClient.setQueryData(applicationKeys.detail(variables.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Delete application mutation
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => applicationsApi.delete(id),
    onSuccess: () => {
      // Invalidate all application queries
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}



