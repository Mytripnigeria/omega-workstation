// Mirrors backend reports DTOs.
export interface SalesReportBucket {
  bucket: string;
  orders: number;
  items: number;
  revenue: number;
}

export interface SalesReport {
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  averageOrderValue: number;
  buckets: SalesReportBucket[];
}

export interface StaffPerformanceRow {
  staffId: string;
  staffName: string;
  ordersProcessed: number;
  salesAttributed: number;
  hoursWorked: number;
}

export interface StaffPerformance {
  rows: StaffPerformanceRow[];
}

export interface KitchenStats {
  ordersServed: number;
  averagePrepMinutes: number;
  itemsPerHour: number;
  busiestHour: number | null;
  inflightCount: number;
}

export interface DeliveryStats {
  totalDeliveries: number;
  delivered: number;
  failed: number;
  successRate: number;
  averageDeliveryMinutes: number;
  byRider: Array<{
    riderStaffId: string;
    riderName: string | null;
    delivered: number;
    failed: number;
  }>;
}

export interface DashboardSummary {
  todayOrders: number;
  todayRevenue: number;
  openOrders: number;
  activeShifts: number;
  lowStockCount: number;
  pendingExpenses: number;
  deliveriesInTransit: number;
}

export interface ReportsRange {
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReportFilter extends ReportsRange {
  groupBy?: "day" | "week" | "month";
}
