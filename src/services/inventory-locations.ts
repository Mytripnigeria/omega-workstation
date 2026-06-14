import { workstationApi } from "./api";
import type { PaginatedResponse } from "@/types/pagination";

export type InventoryLocationType =
  | "instore"
  | "outstore"
  | "warehouse"
  | "kitchen"
  | "bar";

export interface InventoryLocation {
  id: string;
  storeId: string;
  name: string;
  type: InventoryLocationType;
}

export interface InventoryLocationFilter {
  storeId?: string;
  type?: InventoryLocationType;
  limit?: number;
}

function qs(filter: Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  return p.toString();
}

export const inventoryLocationsService = {
  list: (
    filter: InventoryLocationFilter = {},
  ): Promise<PaginatedResponse<InventoryLocation>> => {
    const s = qs(filter as Record<string, unknown>);
    return workstationApi.request<PaginatedResponse<InventoryLocation>>(
      `/inventory-locations${s ? `?${s}` : ""}`,
    );
  },
};
