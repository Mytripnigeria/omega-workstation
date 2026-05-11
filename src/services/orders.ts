import { workstationApi } from "./api";
import type {
  CreateOrderInput,
  Order,
  OrderFilter,
  OrderItem,
  OrderStats,
  OrderStatus,
  PrepStatus,
} from "@/types/order";
import type { PaginatedResponse } from "@/types/pagination";

function buildQueryString(filter: OrderFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const ordersService = {
  list: (filter: OrderFilter = {}): Promise<PaginatedResponse<Order>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Order>>(`/orders${qs ? `?${qs}` : ""}`);
  },

  findOne: (id: string): Promise<Order> =>
    workstationApi.request<Order>(`/orders/${id}`),

  create: (input: CreateOrderInput): Promise<Order> =>
    workstationApi.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateStatus: (id: string, status: OrderStatus): Promise<Order> =>
    workstationApi.request<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string, reason?: string): Promise<Order> =>
    workstationApi.request<Order>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  recordPayment: (
    id: string,
    payload: {
      amount?: number;
      paymentMethodId?: string;
      paymentChannel?: "paystack" | "card" | "cash" | "wallet" | "points";
      paymentReference?: string;
    },
  ): Promise<Order> =>
    workstationApi.request<Order>(`/orders/${id}/payment`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateItemPrep: (id: string, itemId: string, prepStatus: PrepStatus): Promise<OrderItem> =>
    workstationApi.request<OrderItem>(`/orders/${id}/items/${itemId}/prep-status`, {
      method: "POST",
      body: JSON.stringify({ prepStatus }),
    }),

  stats: (storeId?: string): Promise<OrderStats> =>
    workstationApi.request<OrderStats>(
      `/orders/stats${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ""}`,
    ),
};
