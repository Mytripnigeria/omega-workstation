import { workstationApi } from "./api";
import type { Category, CategoryType } from "@/types/category";

export interface CategoryListParams {
  type: CategoryType;
  status?: boolean;
  search?: string;
  /** Categories are store-scoped — the POS must pass the signed-in store. */
  storeId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildQueryString(params: CategoryListParams): string {
  const qs = new URLSearchParams();
  qs.set("type", params.type);
  qs.set("limit", String(params.limit ?? 100));
  if (params.status !== undefined) qs.set("status", String(params.status));
  if (params.storeId) qs.set("storeId", params.storeId);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  return qs.toString();
}

export const categoriesService = {
  list: (params: CategoryListParams): Promise<PaginatedCategories> =>
    workstationApi.request<PaginatedCategories>(`/categories?${buildQueryString(params)}`),
};
