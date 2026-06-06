import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  Clock,
  ArrowRight,
  Calendar,
  Thermometer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workstationAuth } from "@/services/api";
import {
  useLowStockIngredients,
  useExpiringIngredients,
} from "@/hooks/useIngredients";
import {
  useEquipmentTemperatureStatus,
  useMonitoredEquipment,
  useLogTemperatureReading,
} from "@/hooks/useEquipmentTemperature";
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

/** Days from today until `iso` (YYYY-MM-DD), floored. Negative = already expired. */
const daysUntil = (iso: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  return Math.floor((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const InventoryAlerts = ({ className }: InventoryAlertsProps) => {
  const staff = workstationAuth.getStaff();
  const storeId = staff?.storeId;

  const { data, isLoading } = useLowStockIngredients(storeId);
  const { data: expiring = [], isLoading: expiringLoading } =
    useExpiringIngredients(storeId, 14);
  const { data: tempStatus = [], isLoading: tempLoading } =
    useEquipmentTemperatureStatus(storeId);
  const { data: monitoredEquipment = [] } = useMonitoredEquipment(storeId);
  const logReading = useLogTemperatureReading();

  const lowStockItems = (data?.data ?? []).map((i) => ({
    ...i,
    urgency: getUrgency(i),
  }));

  const criticalCount = lowStockItems.filter((i) => i.urgency === "critical").length;
  const warningCount = lowStockItems.filter((i) => i.urgency === "warning").length;
  const expiringCount = expiring.length;
  const expiredCount = expiring.filter(
    (i) => i.expiryDate && daysUntil(i.expiryDate) < 0,
  ).length;
  const outOfRangeCount = tempStatus.filter((t) => t.state === "out_of_range").length;
  const staleCount = tempStatus.filter((t) => t.state === "stale").length;
  const monitoredCount = tempStatus.filter((t) => t.minTempC != null || t.maxTempC != null).length;

  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logEquipmentId, setLogEquipmentId] = useState<string>("");
  const [logTemperature, setLogTemperature] = useState<string>("");
  const [logNote, setLogNote] = useState<string>("");

  const resetLogDialog = () => {
    setLogEquipmentId("");
    setLogTemperature("");
    setLogNote("");
  };

  const handleLogReading = () => {
    const temp = Number(logTemperature);
    if (!logEquipmentId || !Number.isFinite(temp)) return;
    logReading.mutate(
      { equipmentId: logEquipmentId, temperatureC: temp, note: logNote || undefined },
      {
        onSuccess: () => {
          setLogDialogOpen(false);
          resetLogDialog();
        },
      },
    );
  };

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

  const formatExpiry = (iso: string): { label: string; tone: "danger" | "warn" | "ok" } => {
    const d = daysUntil(iso);
    if (d < 0) return { label: `Expired ${-d}d ago`, tone: "danger" };
    if (d === 0) return { label: "Expires today", tone: "danger" };
    if (d <= 3) return { label: `In ${d}d`, tone: "danger" };
    if (d <= 7) return { label: `In ${d}d`, tone: "warn" };
    return { label: `In ${d}d`, tone: "ok" };
  };

  const formatTempReadingAge = (iso: string | null) => {
    if (!iso) return "No readings yet";
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
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
          {expiredCount > 0 && (
            <Badge className="bg-status-error/10 text-status-error">{expiredCount} Expired</Badge>
          )}
          {outOfRangeCount > 0 && (
            <Badge className="bg-status-error/10 text-status-error">
              {outOfRangeCount} Out of range
            </Badge>
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

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Expiring Soon</span>
            </div>
            <p className="text-3xl font-bold text-primary">{expiringCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Use within 14 days</p>
          </CardContent>
        </Card>

        <Card
          className={
            outOfRangeCount > 0
              ? "bg-status-error/5 border-status-error/20"
              : "bg-card border-border"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer
                className={
                  outOfRangeCount > 0
                    ? "w-5 h-5 text-status-error"
                    : "w-5 h-5 text-status-success"
                }
              />
              <span
                className={
                  outOfRangeCount > 0
                    ? "text-sm font-medium text-status-error"
                    : "text-sm font-medium text-status-success"
                }
              >
                Temperature
              </span>
            </div>
            <p
              className={
                outOfRangeCount > 0
                  ? "text-3xl font-bold text-status-error"
                  : "text-3xl font-bold text-status-success"
              }
            >
              {outOfRangeCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {monitoredCount === 0
                ? "No equipment monitored"
                : outOfRangeCount === 0
                  ? `${monitoredCount} in range${staleCount > 0 ? `, ${staleCount} stale` : ""}`
                  : `of ${monitoredCount} monitored`}
            </p>
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

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Temperature Monitor</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLogDialogOpen(true)}
                disabled={monitoredEquipment.length === 0}
              >
                <Thermometer className="w-3 h-3 mr-1" />
                Log reading
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tempLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!tempLoading && tempStatus.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No temperature-monitored equipment yet. Set min/max temps on refrigeration items in
                the admin Equipment page.
              </p>
            )}
            <div className="space-y-3">
              {tempStatus.slice(0, 6).map((t) => {
                const toneCls =
                  t.state === "out_of_range"
                    ? "bg-status-error/10 text-status-error border-status-error/30"
                    : t.state === "stale"
                      ? "bg-status-warning/10 text-status-warning border-status-warning/30"
                      : t.state === "ok"
                        ? "bg-muted text-foreground border-border"
                        : "bg-muted text-muted-foreground border-border";
                const rangeLabel =
                  t.minTempC != null && t.maxTempC != null
                    ? `${t.minTempC}°C – ${t.maxTempC}°C`
                    : t.minTempC != null
                      ? `≥ ${t.minTempC}°C`
                      : t.maxTempC != null
                        ? `≤ ${t.maxTempC}°C`
                        : "no range";
                return (
                  <div
                    key={t.equipmentId}
                    className={`p-3 rounded-xl border flex items-center justify-between ${toneCls}`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Range {rangeLabel} · {formatTempReadingAge(t.lastReadingAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {t.currentTemperature != null ? `${t.currentTemperature}°C` : "—"}
                      </p>
                      <p className="text-xs uppercase tracking-wide">
                        {t.state.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {expiring.length > 0 && (
        <Card className="bg-card border-border mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {expiring.slice(0, 8).map((item) => {
                if (!item.expiryDate) return null;
                const e = formatExpiry(item.expiryDate);
                const toneCls =
                  e.tone === "danger"
                    ? "bg-status-error/10 text-status-error border-status-error/30"
                    : e.tone === "warn"
                      ? "bg-status-warning/10 text-status-warning border-status-warning/30"
                      : "bg-muted text-muted-foreground border-border";
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${toneCls}`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(item.currentStock)} {item.unit} on hand
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{e.label}</p>
                      <p className="text-xs text-muted-foreground">{item.expiryDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={logDialogOpen}
        onOpenChange={(open) => {
          setLogDialogOpen(open);
          if (!open) resetLogDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log temperature reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={logEquipmentId} onValueChange={setLogEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {monitoredEquipment.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., -18.5"
                value={logTemperature}
                onChange={(e) => setLogTemperature(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g., Compressor recently serviced"
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLogReading}
              disabled={
                !logEquipmentId ||
                !Number.isFinite(Number(logTemperature)) ||
                logReading.isPending
              }
            >
              Save reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryAlerts;
