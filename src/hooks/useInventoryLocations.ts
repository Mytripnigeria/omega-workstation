import { useQuery } from "@tanstack/react-query";
import {
  inventoryLocationsService,
  type InventoryLocationFilter,
} from "@/services/inventory-locations";

export function useInventoryLocations(filter: InventoryLocationFilter = {}) {
  return useQuery({
    queryKey: ["inventory-locations", filter],
    queryFn: () => inventoryLocationsService.list(filter),
    staleTime: 5 * 60 * 1000,
  });
}
