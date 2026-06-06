import { workstationApi } from "./api";

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface RestaurantTable {
  id: string;
  businessId: string;
  storeId: string;
  name: string;
  section: string | null;
  capacity: number;
  status: TableStatus;
  positionX: number | null;
  positionY: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TableFilter {
  storeId?: string;
  status?: TableStatus;
  section?: string;
}

function buildQs(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const tablesService = {
  list: (filter: TableFilter = {}): Promise<RestaurantTable[]> =>
    workstationApi.request<RestaurantTable[]>(
      `/tables${buildQs(filter as Record<string, unknown>)}`,
    ),

  updateStatus: (id: string, status: TableStatus): Promise<RestaurantTable> =>
    workstationApi.request<RestaurantTable>(`/tables/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
