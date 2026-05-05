import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveriesService } from "@/services/deliveries";
import type { CreateDeliveryInput, DeliveryFilter } from "@/types/delivery";

export function useDeliveries(filter: DeliveryFilter = {}, refetchInterval?: number) {
  return useQuery({
    queryKey: ["deliveries", filter],
    queryFn: () => deliveriesService.list(filter),
    staleTime: 5 * 1000,
    refetchInterval,
  });
}

export function useMyDeliveries(filter: DeliveryFilter = {}, refetchInterval?: number) {
  return useQuery({
    queryKey: ["deliveries", "my", filter],
    queryFn: () => deliveriesService.listMy(filter),
    staleTime: 5 * 1000,
    refetchInterval,
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeliveryInput) => deliveriesService.create(input),
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
