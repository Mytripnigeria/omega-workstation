import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '@/services/activity-log';
import type { ActivityLogFilter } from '@/types/activity-log';

export function useActivityLog(filter: ActivityLogFilter = {}, enabled = true) {
  return useQuery({
    queryKey: ['activity-log', filter],
    queryFn: () => activityLogService.list(filter),
    staleTime: 10 * 1000,
    enabled,
  });
}
