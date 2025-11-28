import { useQuery } from '@tanstack/react-query';
import { getStatisticsFn } from '../lib/server';

export function useStatistics(userId: string | null) {
  return useQuery({
    queryKey: ['statistics', userId],
    queryFn: async () => {
      if (!userId) {
        return { total: 0, byStatus: {} }
      }
      const result = await getStatisticsFn({ data: { userId } })
      return result
    },
    enabled: !!userId,
  });
}



