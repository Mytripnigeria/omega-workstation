import { workstationApi } from './api';
import type { ActivityEntry, ActivityLogFilter } from '@/types/activity-log';
import type { PaginatedResponse } from '@/types/pagination';

function buildQueryString(filter: ActivityLogFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const activityLogService = {
  list: (filter: ActivityLogFilter = {}): Promise<PaginatedResponse<ActivityEntry>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<ActivityEntry>>(
      `/activity-log${qs ? `?${qs}` : ''}`,
    );
  },
};
