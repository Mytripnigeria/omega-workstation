import { workstationApi } from "./api";

export interface ProductVariation {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  sellingPrice: number;
  stock: number;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface ProductAddonGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number | null;
  addons: ProductAddon[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  productCode: string | null;
  categoryId: string | null;
  categoryName: string | null;
  price: number;
  sellingPrice: number;
  sku: string | null;
  stock: number;
  status: boolean;
  imageUrl: string | null;
  imageFileId: string | null;
  visibility: string[] | null;
  storeId: string;
  variations: ProductVariation[];
  addonGroups?: ProductAddonGroup[];
}

export interface ProductListParams {
  storeId: string;
  status?: boolean;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildQueryString(params: ProductListParams): string {
  const qs = new URLSearchParams();
  qs.set("storeId", params.storeId);
  qs.set("limit", String(params.limit ?? 200));
  if (params.status !== undefined) qs.set("status", String(params.status));
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  return qs.toString();
}

export const productsService = {
  list: (params: ProductListParams): Promise<PaginatedProducts> =>
    workstationApi.request<PaginatedProducts>(`/products?${buildQueryString(params)}`),
};
