import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
  ArrowRight,
  ShoppingCart,
  Thermometer,
  Calendar,
} from "lucide-react";

interface LowStockItem {
  id: string;
  name: string;
  currentQty: number;
  minStock: number;
  unit: string;
  location: string;
  daysUntilEmpty: number;
  lastRestocked: Date;
  urgency: "critical" | "warning" | "low";
}

interface ExpiringItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  daysLeft: number;
  location: string;
}

interface TemperatureAlert {
  id: string;
  equipment: string;
  currentTemp: number;
  targetTemp: number;
  status: "normal" | "warning" | "critical";
  lastChecked: Date;
}

const lowStockItems: LowStockItem[] = [
  {
    id: "ls1",
    name: "Tomatoes",
    currentQty: 8,
    minStock: 20,
    unit: "kg",
    location: "Store Room 1",
    daysUntilEmpty: 1,
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60000),
    urgency: "critical",
  },
  {
    id: "ls2",
    name: "Chicken Breast",
    currentQty: 12,
    minStock: 15,
    unit: "kg",
    location: "Main Freezer",
    daysUntilEmpty: 2,
    lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60000),
    urgency: "warning",
  },
  {
    id: "ls3",
    name: "Cooking Oil",
    currentQty: 8,
    minStock: 10,
    unit: "L",
    location: "Store Room 1",
    daysUntilEmpty: 3,
    lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60000),
    urgency: "warning",
  },
  {
    id: "ls4",
    name: "Rice",
    currentQty: 35,
    minStock: 40,
    unit: "kg",
    location: "Store Room 2",
    daysUntilEmpty: 5,
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60000),
    urgency: "low",
  },
  {
    id: "ls5",
    name: "Onions",
    currentQty: 12,
    minStock: 15,
    unit: "kg",
    location: "Store Room 1",
    daysUntilEmpty: 4,
    lastRestocked: new Date(Date.now() - 4 * 24 * 60 * 60000),
    urgency: "low",
  },
];

const expiringItems: ExpiringItem[] = [
  {
    id: "ex1",
    name: "Fresh Cream",
    quantity: 5,
    unit: "L",
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60000),
    daysLeft: 1,
    location: "Kitchen Chiller",
  },
  {
    id: "ex2",
    name: "Yogurt",
    quantity: 12,
    unit: "cups",
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60000),
    daysLeft: 2,
    location: "Kitchen Chiller",
  },
  {
    id: "ex3",
    name: "Milk",
    quantity: 8,
    unit: "L",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60000),
    daysLeft: 3,
    location: "Kitchen Chiller",
  },
];

const temperatureAlerts: TemperatureAlert[] = [
  {
    id: "t1",
    equipment: "Main Freezer",
    currentTemp: -18,
    targetTemp: -20,
    status: "normal",
    lastChecked: new Date(Date.now() - 30 * 60000),
  },
  {
    id: "t2",
    equipment: "Kitchen Chiller",
    currentTemp: 6,
    targetTemp: 4,
    status: "warning",
    lastChecked: new Date(Date.now() - 15 * 60000),
  },
  {
    id: "t3",
    equipment: "Display Fridge",
    currentTemp: 5,
    targetTemp: 5,
    status: "normal",
    lastChecked: new Date(Date.now() - 45 * 60000),
  },
];

interface InventoryAlertsProps {
  className?: string;
}

const InventoryAlerts = ({ className }: InventoryAlertsProps) => {
  const criticalCount = lowStockItems.filter((i) => i.urgency === "critical").length;
  const warningCount = lowStockItems.filter((i) => i.urgency === "warning").length;
  const expiringCount = expiringItems.filter((i) => i.daysLeft <= 2).length;
  const tempWarnings = temperatureAlerts.filter((t) => t.status !== "normal").length;

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

  const getStockPercentage = (current: number, min: number) => {
    return Math.min(100, Math.round((current / min) * 100));
  };

  const formatDaysAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60000));
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
            <Badge className="bg-status-error/10 text-status-error">
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-status-warning/10 text-status-warning">
              {warningCount} Warning
            </Badge>
          )}
        </div>
      </div>

      {/* Alert Summary */}
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
            <p className="text-xs text-muted-foreground mt-1">Within 2 days</p>
          </CardContent>
        </Card>

        <Card className={tempWarnings > 0 ? "bg-status-warning/5 border-status-warning/20" : "bg-card border-border"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className={`w-5 h-5 ${tempWarnings > 0 ? "text-status-warning" : "text-status-success"}`} />
              <span className={`text-sm font-medium ${tempWarnings > 0 ? "text-status-warning" : "text-status-success"}`}>
                Temperature
              </span>
            </div>
            <p className={`text-3xl font-bold ${tempWarnings > 0 ? "text-status-warning" : "text-status-success"}`}>
              {tempWarnings > 0 ? tempWarnings : "OK"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {tempWarnings > 0 ? "Needs attention" : "All normal"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
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
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${getUrgencyColor(item.urgency)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.urgency === "critical" && (
                          <Badge className="bg-status-error text-white text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {item.currentQty} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {item.minStock} {item.unit} min
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={getStockPercentage(item.currentQty, item.minStock)}
                    className={`h-2 ${item.urgency === "critical" ? "[&>div]:bg-status-error" : "[&>div]:bg-status-warning"}`}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{item.daysUntilEmpty} day{item.daysUntilEmpty !== 1 ? "s" : ""} left
                    </span>
                    <span>Restocked {formatDaysAgo(item.lastRestocked)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Expiring Soon */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      item.daysLeft <= 1
                        ? "bg-status-error/10 border border-status-error/20"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.daysLeft <= 1 ? "bg-status-error/20" : "bg-secondary"
                        }`}
                      >
                        <Calendar
                          className={`w-5 h-5 ${
                            item.daysLeft <= 1 ? "text-status-error" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} • {item.location}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        item.daysLeft <= 1
                          ? "bg-status-error text-white"
                          : "bg-status-warning/10 text-status-warning"
                      }
                    >
                      {item.daysLeft === 0
                        ? "Today"
                        : item.daysLeft === 1
                        ? "Tomorrow"
                        : `${item.daysLeft} days`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temperature Monitoring */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Temperature Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {temperatureAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      alert.status === "warning"
                        ? "bg-status-warning/10 border border-status-warning/20"
                        : alert.status === "critical"
                        ? "bg-status-error/10 border border-status-error/20"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.status === "normal"
                            ? "bg-status-success/10"
                            : alert.status === "warning"
                            ? "bg-status-warning/20"
                            : "bg-status-error/20"
                        }`}
                      >
                        <Thermometer
                          className={`w-5 h-5 ${
                            alert.status === "normal"
                              ? "text-status-success"
                              : alert.status === "warning"
                              ? "text-status-warning"
                              : "text-status-error"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{alert.equipment}</p>
                        <p className="text-xs text-muted-foreground">Target: {alert.targetTemp}°C</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          alert.status === "normal"
                            ? "text-status-success"
                            : alert.status === "warning"
                            ? "text-status-warning"
                            : "text-status-error"
                        }`}
                      >
                        {alert.currentTemp}°C
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{alert.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;