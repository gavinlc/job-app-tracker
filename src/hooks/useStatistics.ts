import { useQuery } from '@tanstack/react-query';
import { getStatisticsFn } from '../lib/server';

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const result = await getStatisticsFn({ data: undefined })
      return result
    },
  });
}



