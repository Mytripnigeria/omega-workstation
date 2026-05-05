import { workstationApi } from "./api";
import type {
  DashboardSummary,
  DeliveryStats,
  KitchenStats,
  ReportsRange,
  SalesReport,
  SalesReportFilter,
  StaffPerformance,
} from "@/types/reports";

function buildQuery(filter: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  return qs.toString();
}

export const reportsService = {
  sales: (filter: SalesReportFilter = {}): Promise<SalesReport> => {
    const qs = buildQuery(filter as Record<string, unknown>);
    return workstationApi.request<SalesReport>(`/reports/sales${qs ? `?${qs}` : ""}`);
  },

  staffPerformance: (filter: ReportsRange = {}): Promise<StaffPerformance> => {
    const qs = buildQuery(filter as Record<string, unknown>);
    return workstationApi.request<StaffPerformance>(
      `/reports/staff-performance${qs ? `?${qs}` : ""}`,
    );
  },

  kitchen: (filter: ReportsRange = {}): Promise<KitchenStats> => {
    const qs = buildQuery(filter as Record<string, unknown>);
    return workstationApi.request<KitchenStats>(`/reports/kitchen${qs ? `?${qs}` : ""}`);
  },

  delivery: (filter: ReportsRange = {}): Promise<DeliveryStats> => {
    const qs = buildQuery(filter as Record<string, unknown>);
    return workstationApi.request<DeliveryStats>(`/reports/delivery${qs ? `?${qs}` : ""}`);
  },

  dashboard: (storeId?: string): Promise<DashboardSummary> => {
    const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
    return workstationApi.request<DashboardSummary>(`/reports/dashboard${qs}`);
  },
};
