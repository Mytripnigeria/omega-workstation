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
