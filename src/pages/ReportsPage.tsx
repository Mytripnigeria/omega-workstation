import { useState } from "react";
import {
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  ChefHat,
  Bike,
  Filter,
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

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
}

interface SalesReport {
  id: string;
  period: string;
  totalSales: number;
  orders: number;
  avgOrderValue: number;
  topItem: string;
}

interface ServiceReport {
  service: string;
  orders: number;
  avgTime: string;
  satisfaction: number;
}

const mockPerformanceMetrics: PerformanceMetric[] = [
  { label: "Orders Processed", value: "47", change: 12, trend: "up" },
  { label: "Avg. Prep Time", value: "8.2 min", change: -5, trend: "up" },
  { label: "Customer Satisfaction", value: "4.8/5", change: 3, trend: "up" },
  { label: "Items Sold", value: "156", change: 8, trend: "up" },
];

const mockSalesReports: SalesReport[] = [
  { id: "s1", period: "Today", totalSales: 124700, orders: 42, avgOrderValue: 2969, topItem: "Jollof Rice (L)" },
  { id: "s2", period: "Yesterday", totalSales: 98500, orders: 35, avgOrderValue: 2814, topItem: "Fried Rice (M)" },
  { id: "s3", period: "This Week", totalSales: 687400, orders: 245, avgOrderValue: 2806, topItem: "Jollof Rice (L)" },
  { id: "s4", period: "Last Week", totalSales: 612300, orders: 218, avgOrderValue: 2809, topItem: "Grilled Chicken" },
  { id: "s5", period: "This Month", totalSales: 2845600, orders: 1024, avgOrderValue: 2779, topItem: "Jollof Rice (L)" },
];

const mockServiceReports: ServiceReport[] = [
  { service: "Dine-in", orders: 156, avgTime: "12 min", satisfaction: 4.7 },
  { service: "Takeaway", orders: 89, avgTime: "8 min", satisfaction: 4.8 },
  { service: "Delivery", orders: 67, avgTime: "25 min", satisfaction: 4.5 },
];

const mockKitchenStats = {
  ordersCompleted: 42,
  avgPrepTime: "8.2 min",
  delayedOrders: 3,
  wastageValue: 4500,
};

const mockDeliveryStats = {
  deliveriesCompleted: 23,
  avgDeliveryTime: "28 min",
  onTimeRate: 87,
  totalDistance: "45 km",
};

const ReportsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("today");
  const [showActivityLog, setShowActivityLog] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
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
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <ActivityLogButton onClick={() => setShowActivityLog(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap mb-6 bg-card border border-border rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg">Sales</TabsTrigger>
            <TabsTrigger value="service" className="rounded-lg">Service</TabsTrigger>
            <TabsTrigger value="kitchen" className="rounded-lg">Kitchen</TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-lg">Delivery</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockPerformanceMetrics.map((metric) => (
                <div key={metric.label} className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-status-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? "text-status-success" : "text-destructive"}`}>
                      {metric.change > 0 ? "+" : ""}{metric.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs yesterday</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-xl font-bold text-foreground">₦124,700</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">75% of daily target</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders Today</p>
                    <p className="text-xl font-bold text-foreground">42</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-status-info w-[60%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">60% of daily target</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customers Served</p>
                    <p className="text-xl font-bold text-foreground">38</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-status-success w-[55%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">55% of daily average</p>
              </div>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total Sales</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Orders</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Avg. Order</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Top Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSalesReports.map((report) => (
                      <tr key={report.id} className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">{report.period}</td>
                        <td className="p-4 text-foreground">₦{report.totalSales.toLocaleString()}</td>
                        <td className="p-4 text-foreground">{report.orders}</td>
                        <td className="p-4 text-foreground">₦{report.avgOrderValue.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge variant="secondary">{report.topItem}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value="service">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockServiceReports.map((service) => (
                <div key={service.service} className="bg-card border border-border rounded-2xl p-5">
                  <h4 className="font-semibold text-foreground mb-4">{service.service}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <span className="text-sm font-medium text-foreground">{service.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Time</span>
                      <span className="text-sm font-medium text-foreground">{service.avgTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Satisfaction</span>
                      <Badge variant="outline">{service.satisfaction}/5 ⭐</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Kitchen Tab */}
          <TabsContent value="kitchen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Orders Completed</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockKitchenStats.ordersCompleted}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Avg. Prep Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockKitchenStats.avgPrepTime}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Delayed Orders</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockKitchenStats.delayedOrders}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Wastage Value</span>
                </div>
                <p className="text-2xl font-bold text-foreground">₦{mockKitchenStats.wastageValue.toLocaleString()}</p>
              </div>
            </div>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Bike className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Deliveries</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockDeliveryStats.deliveriesCompleted}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Avg. Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockDeliveryStats.avgDeliveryTime}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">On-Time Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockDeliveryStats.onTimeRate}%</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Distance Covered</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{mockDeliveryStats.totalDistance}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Reports" />
    </div>
  );
};

export default ReportsPage;