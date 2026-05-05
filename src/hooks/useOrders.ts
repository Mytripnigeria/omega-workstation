import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders";
import type {
  CreateOrderInput,
  OrderFilter,
  OrderStatus,
  PrepStatus,
} from "@/types/order";

export function useOrders(filter: OrderFilter = {}, refetchInterval?: number) {
  return useQuery({
    queryKey: ["orders", filter],
    queryFn: () => ordersService.list(filter),
    staleTime: 5 * 1000,
    refetchInterval,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.findOne(id!),
    enabled: !!id,
  });
}

export function useOrderStats(storeId?: string) {
  return useQuery({
    queryKey: ["orders", "stats", storeId],
    queryFn: () => ordersService.stats(storeId),
    staleTime: 30 * 1000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersService.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      paymentMethodId,
    }: {
      id: string;
      amount?: number;
      paymentMethodId?: string;
    }) => ordersService.recordPayment(id, amount, paymentMethodId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateItemPrep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      prepStatus,
    }: {
      orderId: string;
      itemId: string;
      prepStatus: PrepStatus;
    }) => ordersService.updateItemPrep(orderId, itemId, prepStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
