import { Target, Clock, TrendingUp, ShoppingCart, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { workstationAuth } from "@/services/api";
import { useDashboardSummary, useKitchenStats } from "@/hooks/useReports";

interface KPIModalProps {
  open: boolean;
  onClose: () => void;
}

const KPIModal = ({ open, onClose }: KPIModalProps) => {
  const staff = workstationAuth.getStaff();
  const summary = useDashboardSummary(staff?.storeId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const range = {
    dateFrom: today.toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  };
  const kitchen = useKitchenStats(range);

  const formatCurrency = (n: number) => `₦${Number(n).toLocaleString()}`;

  const stats = [
    {
      label: "Today's orders",
      icon: ShoppingCart,
      color: "text-category-mint",
      value: summary.data?.todayOrders ?? 0,
      sub: `${summary.data?.openOrders ?? 0} open · ${summary.data?.deliveriesInTransit ?? 0} delivering`,
    },
    {
      label: "Today's revenue",
      icon: TrendingUp,
      color: "text-category-pink",
      value: formatCurrency(summary.data?.todayRevenue ?? 0),
      sub: "From completed and in-flight orders",
    },
    {
      label: "Avg prep time",
      icon: Clock,
      color: "text-category-lavender",
      value: `${kitchen.data?.averagePrepMinutes ?? 0} min`,
      sub: `${kitchen.data?.itemsPerHour ?? 0} items/hr`,
    },
    {
      label: "Kitchen in-flight",
      icon: ChefHat,
      color: "text-category-peach",
      value: kitchen.data?.inflightCount ?? 0,
      sub: `${kitchen.data?.ordersServed ?? 0} served today`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today at a glance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
            >
              <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground truncate">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">{s.sub}</p>
              </div>
            </div>
          ))}

          {(summary.data?.lowStockCount ?? 0) > 0 && (
            <p className="text-xs text-status-warning mt-2">
              ⚠ {summary.data?.lowStockCount} ingredient
              {(summary.data?.lowStockCount ?? 0) === 1 ? "" : "s"} below minimum stock
            </p>
          )}
          {(summary.data?.pendingExpenses ?? 0) > 0 && (
            <p className="text-xs text-status-info">
              {summary.data?.pendingExpenses} expense request
              {(summary.data?.pendingExpenses ?? 0) === 1 ? "" : "s"} awaiting review
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KPIModal;
