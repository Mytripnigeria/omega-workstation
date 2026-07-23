import { workstationApi } from "./api";

export interface DeliveryRegion {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  fee: number;
  minOrderAmount: number;
  estimatedMinutes: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface DeliveryRegionFilter {
  storeId?: string;
  isActive?: boolean;
}

export const deliveryRegionsService = {
  list: (filter: DeliveryRegionFilter = {}): Promise<DeliveryRegion[]> => {
    const qs = new URLSearchParams();
    if (filter.storeId) qs.set("storeId", filter.storeId);
    if (filter.isActive !== undefined) qs.set("isActive", String(filter.isActive));
    const q = qs.toString();
    return workstationApi.request<DeliveryRegion[]>(
      `/delivery-regions${q ? `?${q}` : ""}`,
    );
  },
};
