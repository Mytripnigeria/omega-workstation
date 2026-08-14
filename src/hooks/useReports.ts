import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports";
import type { ReportsRange, SalesReportFilter } from "@/types/reports";

export function useSalesReport(filter: SalesReportFilter = {}) {
  return useQuery({
    queryKey: ["reports", "sales", filter],
    queryFn: () => reportsService.sales(filter),
    staleTime: 60 * 1000,
  });
}

export function useStaffPerformance(filter: ReportsRange = {}) {
  return useQuery({
    queryKey: ["reports", "staff", filter],
    queryFn: () => reportsService.staffPerformance(filter),
    staleTime: 60 * 1000,
  });
}

/**
 * Popularity ranking for the POS menu. Cached for five minutes — the ordering
 * only needs to be roughly right, and it must not add load to every POS poll.
 */
export function useProductPopularity(enabled = true) {
  return useQuery({
    queryKey: ["reports", "product-popularity"],
    queryFn: () => reportsService.productPopularity(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useKitchenStats(filter: ReportsRange = {}) {
  return useQuery({
    queryKey: ["reports", "kitchen", filter],
    queryFn: () => reportsService.kitchen(filter),
    staleTime: 30 * 1000,
  });
}

export function useDeliveryStats(filter: ReportsRange = {}) {
  return useQuery({
    queryKey: ["reports", "delivery", filter],
    queryFn: () => reportsService.delivery(filter),
    staleTime: 60 * 1000,
  });
}

export function useDashboardSummary(storeId?: string) {
  return useQuery({
    queryKey: ["reports", "dashboard", storeId],
    queryFn: () => reportsService.dashboard(storeId),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}
