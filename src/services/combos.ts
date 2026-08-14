import { workstationApi } from "./api";

export interface ComboItemProduct {
  id: string;
  name: string;
  sellingPrice: number;
  imageUrl: string | null;
}

export interface ComboItem {
  id: string;
  comboId: string;
  productId: string;
  quantity: number;
  product: ComboItemProduct | null;
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  /** Combo selling price — what the customer pays for the bundle. */
  price: number;
  /** Sum of the member products' individual prices, for the "was" figure. */
  originalPrice: number;
  isActive: boolean;
  imageUrl: string | null;
  storeId: string;
  items: ComboItem[];
}

export interface PaginatedCombos {
  data: Combo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const combosService = {
  list: (storeId: string): Promise<PaginatedCombos> =>
    workstationApi.request<PaginatedCombos>(
      `/combos?storeId=${encodeURIComponent(storeId)}&status=true&limit=200`,
    ),
};
