import { useMemo, useState } from "react";
import {
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ChefHat,
  Bike,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import {
  useSalesReport,
  useStaffPerformance,
  useKitchenStats,
  useDeliveryStats,
} from "@/hooks/useReports";

type Period = "today" | "7d" | "30d" | "90d";

function rangeFor(period: Period): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  if (period === "today") from.setHours(0, 0, 0, 0);
  else if (period === "7d") from.setDate(from.getDate() - 7);
  else if (period === "30d") from.setDate(from.getDate() - 30);
  else if (period === "90d") from.setDate(from.getDate() - 90);
  return {
    dateFrom: from.toISOString().split("T")[0],
    dateTo: to.toISOString().split("T")[0],
  };
}

const formatCurrency = (n: number) => `₦${Number(n).toLocaleString()}`;

const ReportsPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("7d");
  const [showActivityLog, setShowActivityLog] = useState(false);
  const range = useMemo(() => rangeFor(period), [period]);

  const sales = useSalesReport({
    ...range,
    groupBy: period === "90d" ? "week" : "day",
  });
  const staff = useStaffPerformance(range);
  const kitchen = useKitchenStats(range);
  const delivery = useDeliveryStats(range);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Reports</h1>
                  <p className="text-xs text-muted-foreground">Analytics & insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <ActivityLogButton onClick={() => setShowActivityLog(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={ShoppingCart}
            label="Orders"
            value={sales.data?.totalOrders ?? 0}
            sub={`${sales.data?.totalItems ?? 0} items`}
            loading={sales.isLoading}
          />
          <KpiCard
            icon={DollarSign}
            label="Revenue"
            value={formatCurrency(sales.data?.totalRevenue ?? 0)}
            sub={`AOV ${formatCurrency(Math.round(sales.data?.averageOrderValue ?? 0))}`}
            loading={sales.isLoading}
          />
          <KpiCard
            icon={ChefHat}
            label="Avg prep time"
            value={`${kitchen.data?.averagePrepMinutes ?? 0} min`}
            sub={`${kitchen.data?.itemsPerHour ?? 0} items/hr`}
            loading={kitchen.isLoading}
          />
          <KpiCard
            icon={Bike}
            label="Delivery success"
            value={`${(delivery.data?.successRate ?? 0).toFixed(1)}%`}
            sub={`${delivery.data?.delivered ?? 0} of ${delivery.data?.totalDeliveries ?? 0}`}
            loading={delivery.isLoading}
          />
        </div>

        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-card">
              <TrendingUp className="w-4 h-4 mr-1" /> Sales
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-card">
              <Users className="w-4 h-4 mr-1" /> Staff
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="rounded-lg data-[state=active]:bg-card">
              <ChefHat className="w-4 h-4 mr-1" /> Kitchen
            </TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-lg data-[state=active]:bg-card">
              <Bike className="w-4 h-4 mr-1" /> Delivery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Sales by day</h3>
              {sales.isLoading && (
                <p className="text-muted-foreground">Loading...</p>
              )}
              {!sales.isLoading && (sales.data?.buckets.length ?? 0) === 0 && (
                <p className="text-muted-foreground py-8 text-center">
                  No sales data in this range.
                </p>
              )}
              <div className="space-y-2">
                {sales.data?.buckets.map((b) => {
                  const max = Math.max(
                    ...(sales.data?.buckets.map((x) => x.revenue) ?? [1]),
                    1,
                  );
                  const widthPct = (b.revenue / max) * 100;
                  return (
                    <div key={b.bucket} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{b.bucket}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(b.revenue)} · {b.orders} orders ·{" "}
                          {b.items} items
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Staff performance</h3>
              {staff.isLoading && (
                <p className="text-muted-foreground">Loading...</p>
              )}
              {!staff.isLoading && staff.data?.rows.length === 0 && (
                <p className="text-muted-foreground py-8 text-center">
                  No staff activity in this range.
                </p>
              )}
              <div className="space-y-2">
                {staff.data?.rows.map((r) => (
                  <div
                    key={r.staffId}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {r.staffName || "Staff"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.ordersProcessed} orders · {r.hoursWorked.toFixed(1)}h
                        worked
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(r.salesAttributed)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kitchen">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KpiCard
                icon={ShoppingCart}
                label="Orders served"
                value={kitchen.data?.ordersServed ?? 0}
                sub=""
                loading={kitchen.isLoading}
              />
              <KpiCard
                icon={Clock}
                label="Avg prep time"
                value={`${kitchen.data?.averagePrepMinutes ?? 0} min`}
                sub={`${kitchen.data?.itemsPerHour ?? 0} items/hr`}
                loading={kitchen.isLoading}
              />
              <KpiCard
                icon={TrendingUp}
                label="Busiest hour"
                value={
                  kitchen.data?.busiestHour != null
                    ? `${String(kitchen.data.busiestHour).padStart(2, "0")}:00`
                    : "—"
                }
                sub=""
                loading={kitchen.isLoading}
              />
              <KpiCard
                icon={ChefHat}
                label="Currently in flight"
                value={kitchen.data?.inflightCount ?? 0}
                sub="Preparing or ready"
                loading={kitchen.isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <KpiCard
                icon={Bike}
                label="Total deliveries"
                value={delivery.data?.totalDeliveries ?? 0}
                sub={`${delivery.data?.delivered ?? 0} delivered · ${delivery.data?.failed ?? 0} failed`}
                loading={delivery.isLoading}
              />
              <KpiCard
                icon={Clock}
                label="Avg delivery time"
                value={`${delivery.data?.averageDeliveryMinutes ?? 0} min`}
                sub={`${(delivery.data?.successRate ?? 0).toFixed(1)}% success`}
                loading={delivery.isLoading}
              />
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">By rider</h3>
              {!delivery.isLoading && (delivery.data?.byRider.length ?? 0) === 0 && (
                <p className="text-muted-foreground py-8 text-center">
                  No rider activity.
                </p>
              )}
              <div className="space-y-2">
                {delivery.data?.byRider.map((r) => (
                  <div
                    key={r.riderStaffId}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                  >
                    <span className="font-medium text-foreground">
                      {r.riderName ?? "Rider"}
                    </span>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge className="bg-status-success/10 text-status-success">
                        {r.delivered} delivered
                      </Badge>
                      {r.failed > 0 && (
                        <Badge className="bg-destructive/10 text-destructive">
                          {r.failed} failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Reports"
      />
    </div>
  );
};

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

const KpiCard = ({ icon: Icon, label, value, sub, loading }: KpiCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground truncate">
          {loading ? "—" : value}
        </p>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  </div>
);

export default ReportsPage;
