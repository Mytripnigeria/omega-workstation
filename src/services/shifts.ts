import { workstationApi } from './api';
import type { Shift, ShiftFilter } from '@/types/shift';
import type { PaginatedResponse } from '@/types/pagination';

function buildQueryString(filter: ShiftFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const shiftsService = {
  list: (filter: ShiftFilter = {}): Promise<PaginatedResponse<Shift>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Shift>>(`/shifts${qs ? `?${qs}` : ''}`);
  },

  findOne: (id: string): Promise<Shift> => workstationApi.request<Shift>(`/shifts/${id}`),

  clockIn: (id: string): Promise<Shift> =>
    workstationApi.request<Shift>(`/shifts/${id}/clock-in`, { method: 'POST' }),

  clockOut: (id: string): Promise<Shift> =>
    workstationApi.request<Shift>(`/shifts/${id}/clock-out`, { method: 'POST' }),

  updateChecklist: (id: string, checklist: Shift['checklist']): Promise<Shift> =>
    workstationApi.request<Shift>(`/shifts/${id}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify({ checklist }),
    }),
};
