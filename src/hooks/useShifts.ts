import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shiftsService } from '@/services/shifts';
import { getCurrentCoords } from '@/lib/geolocation';
import type { ChecklistCategory, ShiftFilter } from '@/types/shift';

export function useShifts(filter: ShiftFilter = {}) {
  return useQuery({
    queryKey: ['shifts', filter],
    queryFn: () => shiftsService.list(filter),
    staleTime: 30 * 1000,
  });
}

export function useMyShifts(staffId: string | undefined, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['shifts', 'my', staffId, dateFrom, dateTo],
    queryFn: () => shiftsService.list({ staffId, dateFrom, dateTo, limit: 50 }),
    enabled: !!staffId,
    staleTime: 30 * 1000,
  });
}

export function useActiveShift(staffId: string | undefined) {
  return useQuery({
    queryKey: ['shifts', 'active', staffId],
    queryFn: async () => {
      const res = await shiftsService.list({ staffId, status: 'in-progress', limit: 1 });
      return res.data[0] ?? null;
    },
    enabled: !!staffId,
    staleTime: 15 * 1000,
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    // Capture device coords transparently so geofenced clock-in works without
    // changing callers; the backend ignores them unless geofencing is enabled.
    mutationFn: async (id: string) => {
      const coords = await getCurrentCoords();
      return shiftsService.clockIn(id, coords ?? undefined);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsService.clockOut(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
}

export function useUpdateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checklist }: { id: string; checklist: ChecklistCategory[] | null }) =>
      shiftsService.updateChecklist(id, checklist),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
}
