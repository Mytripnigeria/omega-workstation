import { useQuery } from "@tanstack/react-query";
import { combosService, type Combo } from "@/services/combos";
import { workstationAuth } from "@/services/api";

/**
 * Active combo meals for the current staff member's store, for the POS and
 * self-service menus.
 */
export function useCombos(enabled = true) {
  const storeId = workstationAuth.getStaff()?.storeId ?? "";
  return useQuery<Combo[]>({
    queryKey: ["combos", storeId],
    queryFn: async () => {
      const res = await combosService.list(storeId);
      return res.data;
    },
    enabled: enabled && !!storeId,
    staleTime: 60 * 1000,
  });
}
