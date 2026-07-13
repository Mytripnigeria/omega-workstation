import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cashSessionsService,
  type CloseCashSessionInput,
  type OpenCashSessionInput,
} from "@/services/cash-sessions";

export function useMyActiveCashSession() {
  return useQuery({
    queryKey: ["cash-session", "active"],
    queryFn: () => cashSessionsService.myActive(),
    staleTime: 10 * 1000,
  });
}

/** Open registers on my store I can join. Only fetched when `enabled`. */
export function useStoreActiveCashSessions(enabled: boolean) {
  return useQuery({
    queryKey: ["cash-session", "store-active"],
    queryFn: () => cashSessionsService.storeActive(),
    staleTime: 10 * 1000,
    enabled,
  });
}

export function useJoinCashSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cashSessionsService.join(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash-session"] }),
  });
}

export function useOpenCashSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpenCashSessionInput) => cashSessionsService.open(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash-session"] }),
  });
}

export function useCloseCashSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CloseCashSessionInput }) =>
      cashSessionsService.close(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash-session"] }),
  });
}
