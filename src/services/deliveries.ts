import { workstationApi } from "./api";
import type {
  CreateDeliveryInput,
  Delivery,
  DeliveryFilter,
} from "@/types/delivery";
import type { PaginatedResponse } from "@/types/pagination";

function buildQueryString(filter: DeliveryFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const deliveriesService = {
  list: (filter: DeliveryFilter = {}): Promise<PaginatedResponse<Delivery>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Delivery>>(
      `/deliveries${qs ? `?${qs}` : ""}`,
    );
  },

  listMy: (filter: DeliveryFilter = {}): Promise<PaginatedResponse<Delivery>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Delivery>>(
      `/deliveries/my${qs ? `?${qs}` : ""}`,
    );
  },

  findOne: (id: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}`),

  create: (input: CreateDeliveryInput): Promise<Delivery> =>
    workstationApi.request<Delivery>("/deliveries", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  dispatch: (id: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}/dispatch`, { method: "POST" }),

  assign: (id: string, riderStaffId: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ riderStaffId }),
    }),

  pickup: (id: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}/pickup`, { method: "POST" }),

  deliver: (id: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}/deliver`, { method: "POST" }),

  fail: (id: string, reason: string): Promise<Delivery> =>
    workstationApi.request<Delivery>(`/deliveries/${id}/fail`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
