import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  Clock,
  ArrowRight,
  Thermometer,
  Calendar,
} from "lucide-react";
import { workstationAuth } from "@/services/api";
import { useLowStockIngredients } from "@/hooks/useIngredients";
import type { Ingredient } from "@/types/ingredient";

interface InventoryAlertsProps {
  className?: string;
}

const getUrgency = (i: Ingredient): "critical" | "warning" | "low" => {
  const cur = Number(i.currentStock);
  const min = Number(i.minStock);
  if (min <= 0) return "low";
  const ratio = cur / min;
  if (ratio <= 0.5) return "critical";
  if (ratio <= 1) return "warning";
  return "low";
};

const InventoryAlerts = ({ className }: InventoryAlertsProps) => {
  const staff = workstationAuth.getStaff();
  const { data, isLoading } = useLowStockIngredients(staff?.storeId);

  const lowStockItems = (data?.data ?? []).map((i) => ({
    ...i,
    urgency: getUrgency(i),
  }));

  const criticalCount = lowStockItems.filter((i) => i.urgency === "critical").length;
  const warningCount = lowStockItems.filter((i) => i.urgency === "warning").length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-status-error/10 text-status-error border-status-error/30";
      case "warning":
        return "bg-status-warning/10 text-status-warning border-status-warning/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStockPercentage = (current: number, min: number) =>
    min > 0 ? Math.min(100, Math.round((current / min) * 100)) : 100;

  const formatDaysAgo = (date: string | null) => {
    if (!date) return "Never";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60000));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Inventory Alerts</h3>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge className="bg-status-error/10 text-status-error">{criticalCount} Critical</Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-status-warning/10 text-status-warning">{warningCount} Warning</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-status-error/5 border-status-error/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-status-error" />
              <span className="text-sm font-medium text-status-error">Critical Stock</span>
            </div>
            <p className="text-3xl font-bold text-status-error">{criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Need immediate reorder</p>
          </CardContent>
        </Card>

        <Card className="bg-status-warning/5 border-status-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-status-warning" />
              <span className="text-sm font-medium text-status-warning">Low Stock</span>
            </div>
            <p className="text-3xl font-bold text-status-warning">{warningCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Below minimum level</p>
          </CardContent>
        </Card>

        {/* Expiring & temperature alerts require dedicated modules — placeholder. */}
        <Card className="bg-primary/5 border-primary/20 opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Expiring Soon</span>
            </div>
            <p className="text-3xl font-bold text-primary">—</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-status-success" />
              <span className="text-sm font-medium text-status-success">Temperature</span>
            </div>
            <p className="text-3xl font-bold text-status-success">—</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Low Stock Items</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!isLoading && lowStockItems.length === 0 && (
              <p className="text-sm text-muted-foreground">All ingredients above minimum stock.</p>
            )}
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border ${getUrgencyColor(item.urgency)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.urgency === "critical" && (
                          <Badge className="bg-status-error text-white text-xs">Urgent</Badge>
                        )}
                      </div>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {Number(item.currentStock)} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {Number(item.minStock)} {item.unit} min
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={getStockPercentage(Number(item.currentStock), Number(item.minStock))}
                    className={`h-2 ${
                      item.urgency === "critical" ? "[&>div]:bg-status-error" : "[&>div]:bg-status-warning"
                    }`}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last restock: {formatDaysAgo(item.lastRestocked)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring & Temperature Monitor sections deferred to later phases */}
        <div className="space-y-6">
          <Card className="bg-card border-border opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Batch expiry tracking will be available with the inventory-movements module.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Temperature Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Equipment temperature monitoring requires a dedicated module (planned).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;
