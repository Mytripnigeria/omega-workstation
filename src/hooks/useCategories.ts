import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories";
import type { Category, CategoryType } from "@/types/category";

interface UseCategoriesOptions {
  /** Filter to active categories only. Defaults to true. */
  activeOnly?: boolean;
  /** Disable the query (e.g., when prerequisites are missing). */
  enabled?: boolean;
}

/**
 * Fetches the categories of a single type for the current business.
 * Response is normalized to a Category[] for direct consumption.
 */
export function useCategories(type: CategoryType, opts: UseCategoriesOptions = {}) {
  const { activeOnly = true, enabled = true } = opts;
  return useQuery<Category[]>({
    queryKey: ["categories", type, activeOnly],
    queryFn: async () => {
      const res = await categoriesService.list({ type, status: activeOnly });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
