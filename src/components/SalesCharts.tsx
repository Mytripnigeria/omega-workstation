import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock } from "lucide-react";

// Sales data by hour
const hourlySalesData = [
  { hour: "6AM", sales: 8500, orders: 12 },
  { hour: "7AM", sales: 12400, orders: 18 },
  { hour: "8AM", sales: 18600, orders: 28 },
  { hour: "9AM", sales: 15200, orders: 22 },
  { hour: "10AM", sales: 9800, orders: 14 },
  { hour: "11AM", sales: 22100, orders: 32 },
  { hour: "12PM", sales: 35600, orders: 48 },
  { hour: "1PM", sales: 42300, orders: 58 },
  { hour: "2PM", sales: 28400, orders: 38 },
  { hour: "3PM", sales: 18700, orders: 26 },
  { hour: "4PM", sales: 14200, orders: 20 },
  { hour: "5PM", sales: 24800, orders: 34 },
];

// Weekly sales data
const weeklySalesData = [
  { day: "Mon", sales: 124500, orders: 42, target: 150000 },
  { day: "Tue", sales: 138200, orders: 48, target: 150000 },
  { day: "Wed", sales: 156800, orders: 54, target: 150000 },
  { day: "Thu", sales: 142300, orders: 50, target: 150000 },
  { day: "Fri", sales: 189600, orders: 68, target: 180000 },
  { day: "Sat", sales: 215400, orders: 78, target: 200000 },
  { day: "Sun", sales: 178900, orders: 62, target: 180000 },
];

// Revenue by category
const categoryData = [
  { name: "Rice Dishes", value: 45200, color: "hsl(var(--primary))" },
  { name: "Proteins", value: 32400, color: "hsl(var(--status-success))" },
  { name: "Drinks", value: 18600, color: "hsl(var(--status-info))" },
  { name: "Sides", value: 15800, color: "hsl(var(--status-warning))" },
  { name: "Desserts", value: 8700, color: "hsl(var(--category-lavender))" },
];

// Order type breakdown
const orderTypeData = [
  { name: "Dine-in", value: 35, color: "hsl(var(--primary))" },
  { name: "Takeaway", value: 28, color: "hsl(var(--status-success))" },
  { name: "Delivery", value: 37, color: "hsl(var(--status-info))" },
];

// Peak hours analysis
const peakHoursData = [
  { hour: "12PM-1PM", orders: 58, avgValue: 3200 },
  { hour: "1PM-2PM", orders: 52, avgValue: 2980 },
  { hour: "6PM-7PM", orders: 48, avgValue: 3450 },
  { hour: "7PM-8PM", orders: 45, avgValue: 3680 },
  { hour: "8AM-9AM", orders: 28, avgValue: 2100 },
];

interface SalesChartsProps {
  className?: string;
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `₦${(value / 1000).toFixed(1)}k`;
  }
  return `₦${value}`;
};

const SalesCharts = ({ className }: SalesChartsProps) => {
  const [period, setPeriod] = useState("today");

  const totalRevenue = weeklySalesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = weeklySalesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);
  const targetAchievement = Math.round(
    (weeklySalesData.reduce((sum, d) => sum + d.sales, 0) /
      weeklySalesData.reduce((sum, d) => sum + d.target, 0)) *
      100
  );

  return (
    <div className={className}>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sales Analytics</h3>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-secondary/50 p-1 rounded-lg h-9">
            <TabsTrigger value="today" className="rounded-md text-xs px-3 data-[state=active]:bg-card">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-md text-xs px-3 data-[state=active]:bg-card">
              This Week
            </TabsTrigger>
            <TabsTrigger value="month" className="rounded-md text-xs px-3 data-[state=active]:bg-card">
              This Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₦{(totalRevenue / 1000).toFixed(0)}k</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+12.5% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-status-success" />
              </div>
              <span className="text-sm text-muted-foreground">Orders</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+8.3% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-status-info" />
              </div>
              <span className="text-sm text-muted-foreground">Avg Order</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₦{avgOrderValue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+3.2% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-status-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Target</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{targetAchievement}%</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">of weekly goal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={period === "today" ? hourlySalesData : weeklySalesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey={period === "today" ? "hour" : "day"}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Sales"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Category */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Sales vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`]}
                  />
                  <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Types */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Order Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <div className="w-full max-w-xs">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {orderTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {orderTypeData.map((type) => (
                    <div key={type.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs text-muted-foreground">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card className="bg-card border-border mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Peak Hours Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {peakHoursData.map((peak, index) => (
              <div
                key={peak.hour}
                className={`p-4 rounded-xl ${
                  index === 0
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{peak.hour}</span>
                  {index === 0 && (
                    <Badge className="bg-primary/20 text-primary text-xs">Peak</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{peak.orders}</p>
                <p className="text-xs text-muted-foreground">orders</p>
                <p className="text-sm text-foreground mt-2">
                  ₦{peak.avgValue.toLocaleString()} avg
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesCharts;