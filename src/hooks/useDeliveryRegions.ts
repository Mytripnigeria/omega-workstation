import { useQuery } from "@tanstack/react-query";
import {
  deliveryRegionsService,
  type DeliveryRegion,
  type DeliveryRegionFilter,
} from "@/services/delivery-regions";

/**
 * Active delivery regions for a store. The counter POS needs these to price a
 * delivery order — the fee comes from the chosen region, never from the POS.
 */
export function useDeliveryRegions(
  filter: DeliveryRegionFilter = {},
  opts: { enabled?: boolean } = {},
) {
  return useQuery<DeliveryRegion[]>({
    queryKey: ["delivery-regions", filter],
    queryFn: () => deliveryRegionsService.list({ isActive: true, ...filter }),
    staleTime: 5 * 60 * 1000,
    enabled: opts.enabled ?? true,
  });
}
