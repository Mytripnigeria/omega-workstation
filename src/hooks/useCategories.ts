import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories";
import type { Category, CategoryType } from "@/types/category";

interface UseCategoriesOptions {
  /** Filter to active categories only. Defaults to true. */
  activeOnly?: boolean;
  /** Store scope — categories are store-scoped, so the POS passes its store. */
  storeId?: string;
  /** Disable the query (e.g., when prerequisites are missing). */
  enabled?: boolean;
}

/**
 * Fetches the categories of a single type for the current business.
 * Response is normalized to a Category[] for direct consumption.
 */
export function useCategories(type: CategoryType, opts: UseCategoriesOptions = {}) {
  const { activeOnly = true, storeId, enabled = true } = opts;
  return useQuery<Category[]>({
    queryKey: ["categories", type, activeOnly, storeId ?? null],
    queryFn: async () => {
      // The backend reads `status` as an exact match, not as "active only":
      // omit it to get every category, send true to restrict to active ones.
      // Passing `false` used to return ONLY INACTIVE categories, which is why
      // the POS showed no category pills even though the items were there.
      // Categories are store-scoped, so pass the signed-in store.
      const res = await categoriesService.list({
        type,
        status: activeOnly ? true : undefined,
        storeId,
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
