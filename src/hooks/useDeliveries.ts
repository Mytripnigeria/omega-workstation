import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveriesService } from "@/services/deliveries";
import type { CreateDeliveryInput, DeliveryFilter } from "@/types/delivery";

// React Query pauses `refetchInterval` whenever the window loses focus. A
// delivery tablet is usually on a stand next to another app, so the board went
// stale exactly when it mattered — polling in the background keeps it live.
export function useDeliveries(filter: DeliveryFilter = {}, refetchInterval?: number) {
  return useQuery({
    queryKey: ["deliveries", filter],
    queryFn: () => deliveriesService.list(filter),
    staleTime: 5 * 1000,
    refetchInterval,
    refetchIntervalInBackground: true,
  });
}

export function useMyDeliveries(filter: DeliveryFilter = {}, refetchInterval?: number) {
  return useQuery({
    queryKey: ["deliveries", "my", filter],
    queryFn: () => deliveriesService.listMy(filter),
    staleTime: 5 * 1000,
    refetchInterval,
    refetchIntervalInBackground: true,
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeliveryInput) => deliveriesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}

export function useDispatchDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveriesService.dispatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}

export function useAssignDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, riderStaffId }: { id: string; riderStaffId: string }) =>
      deliveriesService.assign(id, riderStaffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}

export function usePickupDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveriesService.pickup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}

export function useDeliverDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveriesService.deliver(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}

export function useFailDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      deliveriesService.fail(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });
}
