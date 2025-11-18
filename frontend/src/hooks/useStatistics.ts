import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../api/client';

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsApi.get(),
  });
}



