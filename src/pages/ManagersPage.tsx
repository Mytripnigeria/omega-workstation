import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  Users,
  Clock,
  ShoppingCart,
  ChefHat,
  Bike,
  AlertTriangle,
  DollarSign,
  Receipt,
  Package,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isManagerRole } from "@/lib/roles";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import {
  useDashboardSummary,
  useKitchenStats,
  useDeliveryStats,
  useSalesReport,
  useStaffPerformance,
} from "@/hooks/useReports";
import { useShifts } from "@/hooks/useShifts";
import { useActivityLog } from "@/hooks/useActivityLog";
import { workstationAuth } from "@/services/api";

const formatCurrency = (n: number) => `₦${Number(n).toLocaleString()}`;

const ManagersPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const [showActivityLog, setShowActivityLog] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const range = {
    dateFrom: today.toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  };

  const summary = useDashboardSummary(staff?.storeId);
  const sales = useSalesReport({ ...range, groupBy: "day" });
  const kitchen = useKitchenStats(range);
  const delivery = useDeliveryStats(range);
  const staffPerf = useStaffPerformance(range);
  const onShift = useShifts({ status: "in-progress", limit: 50 });
  const activity = useActivityLog({ limit: 15 });

  if (!isManagerRole()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-lg font-bold text-foreground mb-1">Restricted</h1>
          <p className="text-sm text-muted-foreground mb-4">
            The Managers overview is available to managers only.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-xl">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

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
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    Manager Overview
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Live operations snapshot
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={ShoppingCart}
            label="Today's orders"
            value={summary.data?.todayOrders ?? 0}
            sub={`${summary.data?.openOrders ?? 0} open`}
          />
          <KpiCard
            icon={DollarSign}
            label="Today's revenue"
            value={formatCurrency(summary.data?.todayRevenue ?? 0)}
            sub={`AOV ${formatCurrency(Math.round(sales.data?.averageOrderValue ?? 0))}`}
          />
          <KpiCard
            icon={Users}
            label="Active shifts"
            value={summary.data?.activeShifts ?? 0}
            sub={`${onShift.data?.data.length ?? 0} on the floor`}
          />
          <KpiCard
            icon={AlertTriangle}
            label="Attention needed"
            value={
              (summary.data?.lowStockCount ?? 0) +
              (summary.data?.pendingExpenses ?? 0)
            }
            sub={`${summary.data?.lowStockCount ?? 0} low stock · ${summary.data?.pendingExpenses ?? 0} pending expenses`}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card">
              Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-card">
              Staff ({onShift.data?.data.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-card">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SectionCard
                icon={ChefHat}
                title="Kitchen"
                subtitle={`${kitchen.data?.inflightCount ?? 0} in flight`}
                metrics={[
                  { label: "Avg prep", value: `${kitchen.data?.averagePrepMinutes ?? 0} min` },
                  { label: "Items/hr", value: `${kitchen.data?.itemsPerHour ?? 0}` },
                  { label: "Served today", value: `${kitchen.data?.ordersServed ?? 0}` },
                ]}
              />
              <SectionCard
                icon={Bike}
                title="Delivery"
                subtitle={`${summary.data?.deliveriesInTransit ?? 0} in transit`}
                metrics={[
                  { label: "Success rate", value: `${(delivery.data?.successRate ?? 0).toFixed(1)}%` },
                  { label: "Avg time", value: `${delivery.data?.averageDeliveryMinutes ?? 0} min` },
                  { label: "Today", value: `${delivery.data?.totalDeliveries ?? 0}` },
                ]}
              />
              <SectionCard
                icon={Package}
                title="Inventory & expenses"
                subtitle={`${summary.data?.lowStockCount ?? 0} low-stock items`}
                metrics={[
                  { label: "Pending expenses", value: `${summary.data?.pendingExpenses ?? 0}` },
                ]}
              />
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top performers today
              </h3>
              {staffPerf.isLoading && (
                <p className="text-muted-foreground">Loading...</p>
              )}
              {!staffPerf.isLoading &&
                (staffPerf.data?.rows.length ?? 0) === 0 && (
                  <p className="text-muted-foreground py-4 text-center">
                    No staff activity yet today.
                  </p>
                )}
              <div className="space-y-2">
                {staffPerf.data?.rows.slice(0, 5).map((r) => (
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

          <TabsContent value="staff">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Currently on shift
              </h3>
              {onShift.isLoading && (
                <p className="text-muted-foreground">Loading...</p>
              )}
              {!onShift.isLoading &&
                (onShift.data?.data.length ?? 0) === 0 && (
                  <p className="text-muted-foreground py-8 text-center">
                    No staff currently clocked in.
                  </p>
                )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {onShift.data?.data.map((s) => (
                  <div key={s.id} className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-foreground">{s.staffName}</p>
                      <Badge className="bg-status-success/10 text-status-success text-xs">
                        On shift
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.roleName ?? "Staff"} · {s.startTime} – {s.endTime}
                    </p>
                    {s.actualClockIn && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Clocked in{" "}
                        {new Date(s.actualClockIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Recent activity
              </h3>
              {activity.isLoading && (
                <p className="text-muted-foreground">Loading...</p>
              )}
              {!activity.isLoading &&
                (activity.data?.data.length ?? 0) === 0 && (
                  <p className="text-muted-foreground py-8 text-center">
                    No recent activity.
                  </p>
                )}
              <div className="space-y-2">
                {activity.data?.data.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">
                          {entry.actorName}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {entry.action}
                        </span>
                      </div>
                      {entry.metadata &&
                        Object.keys(entry.metadata).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                            {Object.entries(entry.metadata)
                              .map(([k, v]) => `${k}=${String(v)}`)
                              .join(" · ")}
                          </p>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
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
        pageName="Manager Overview"
      />
    </div>
  );
};

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}

const KpiCard = ({ icon: Icon, label, value, sub }: KpiCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  </div>
);

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
}

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  metrics,
}: SectionCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-2">
      {metrics.map((m) => (
        <div key={m.label} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{m.label}</span>
          <span className="font-medium text-foreground">{m.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ManagersPage;
