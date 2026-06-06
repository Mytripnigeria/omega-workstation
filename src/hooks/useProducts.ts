import { useQuery } from "@tanstack/react-query";
import { productsService, type Product } from "@/services/products";
import { workstationAuth } from "@/services/api";

interface UseProductsOptions {
  /** Filter to active (status=true) products only. Defaults to true. */
  activeOnly?: boolean;
  /** Disable the query (e.g., when prerequisites are missing). */
  enabled?: boolean;
}

/**
 * Loads the current staff's store products for the POS menu.
 * Returns Product[] for direct consumption.
 */
export function useProducts(opts: UseProductsOptions = {}) {
  const { activeOnly = true, enabled = true } = opts;
  const staff = workstationAuth.getStaff();
  const storeId = staff?.storeId ?? "";
  return useQuery<Product[]>({
    queryKey: ["products", storeId, activeOnly],
    queryFn: async () => {
      const res = await productsService.list({
        storeId,
        status: activeOnly,
        limit: 200,
      });
      return res.data;
    },
    enabled: enabled && !!storeId,
    staleTime: 60 * 1000,
  });
}
