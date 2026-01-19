import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Users,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Zap,
  ThumbsUp,
  Timer,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  position: string;
  avatar: string;
  ordersCompleted: number;
  avgServiceTime: number;
  customerRating: number;
  efficiency: number;
  punctuality: number;
  teamwork: number;
  hoursWorked: number;
  tips: number;
  trend: "up" | "down" | "neutral";
}

const mockStaffPerformance: StaffMember[] = [
  {
    id: "s1",
    name: "John Adeyemi",
    position: "Kitchen Staff",
    avatar: "JA",
    ordersCompleted: 156,
    avgServiceTime: 7.2,
    customerRating: 4.8,
    efficiency: 92,
    punctuality: 98,
    teamwork: 85,
    hoursWorked: 42,
    tips: 12500,
    trend: "up",
  },
  {
    id: "s2",
    name: "Sarah Okonkwo",
    position: "Waiter",
    avatar: "SO",
    ordersCompleted: 124,
    avgServiceTime: 3.5,
    customerRating: 4.9,
    efficiency: 96,
    punctuality: 95,
    teamwork: 92,
    hoursWorked: 38,
    tips: 28400,
    trend: "up",
  },
  {
    id: "s3",
    name: "Michael Bello",
    position: "Cashier",
    avatar: "MB",
    ordersCompleted: 298,
    avgServiceTime: 1.8,
    customerRating: 4.6,
    efficiency: 88,
    punctuality: 82,
    teamwork: 78,
    hoursWorked: 45,
    tips: 8200,
    trend: "down",
  },
  {
    id: "s4",
    name: "Amara Eze",
    position: "Delivery Rider",
    avatar: "AE",
    ordersCompleted: 89,
    avgServiceTime: 22.5,
    customerRating: 4.7,
    efficiency: 91,
    punctuality: 94,
    teamwork: 88,
    hoursWorked: 40,
    tips: 15600,
    trend: "up",
  },
  {
    id: "s5",
    name: "David Okoro",
    position: "Kitchen Staff",
    avatar: "DO",
    ordersCompleted: 142,
    avgServiceTime: 8.1,
    customerRating: 4.5,
    efficiency: 85,
    punctuality: 90,
    teamwork: 95,
    hoursWorked: 44,
    tips: 9800,
    trend: "neutral",
  },
];

// Team averages for comparison
const teamAverages = {
  ordersCompleted: 162,
  avgServiceTime: 8.6,
  customerRating: 4.7,
  efficiency: 90,
};

interface StaffPerformanceProps {
  className?: string;
}

const StaffPerformance = ({ className }: StaffPerformanceProps) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Calculate team stats
  const totalOrders = mockStaffPerformance.reduce((sum, s) => sum + s.ordersCompleted, 0);
  const avgRating =
    mockStaffPerformance.reduce((sum, s) => sum + s.customerRating, 0) /
    mockStaffPerformance.length;
  const totalHours = mockStaffPerformance.reduce((sum, s) => sum + s.hoursWorked, 0);
  const totalTips = mockStaffPerformance.reduce((sum, s) => sum + s.tips, 0);

  // Top performers
  const topByOrders = [...mockStaffPerformance].sort(
    (a, b) => b.ordersCompleted - a.ordersCompleted
  )[0];
  const topByRating = [...mockStaffPerformance].sort(
    (a, b) => b.customerRating - a.customerRating
  )[0];
  const topByEfficiency = [...mockStaffPerformance].sort(
    (a, b) => b.efficiency - a.efficiency
  )[0];

  // Chart data for orders comparison
  const ordersChartData = mockStaffPerformance.map((staff) => ({
    name: staff.name.split(" ")[0],
    orders: staff.ordersCompleted,
    target: teamAverages.ordersCompleted,
  }));

  // Radar data for selected staff
  const getRadarData = (staff: StaffMember) => [
    { metric: "Efficiency", value: staff.efficiency, fullMark: 100 },
    { metric: "Punctuality", value: staff.punctuality, fullMark: 100 },
    { metric: "Teamwork", value: staff.teamwork, fullMark: 100 },
    { metric: "Rating", value: staff.customerRating * 20, fullMark: 100 },
    { metric: "Speed", value: Math.max(0, 100 - staff.avgServiceTime * 5), fullMark: 100 },
  ];

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Kitchen Staff":
        return "bg-primary/10 text-primary";
      case "Waiter":
        return "bg-status-success/10 text-status-success";
      case "Cashier":
        return "bg-status-info/10 text-status-info";
      case "Delivery Rider":
        return "bg-status-warning/10 text-status-warning";
      default:
        return "bg-secondary text-foreground";
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Staff Performance</h3>
        <Badge variant="outline" className="rounded-lg">
          This Week
        </Badge>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Team Orders</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+15% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-status-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}/5</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+0.2 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-status-info" />
              </div>
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-xs text-muted-foreground mt-1">across {mockStaffPerformance.length} staff</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-status-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Tips</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₦{(totalTips / 1000).toFixed(1)}k</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-xs text-status-success">+8% this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Award className="w-5 h-5 text-status-warning" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                {topByOrders.avatar}
              </div>
              <div>
                <p className="font-medium text-foreground">{topByOrders.name}</p>
                <p className="text-xs text-muted-foreground">Most Orders: {topByOrders.ordersCompleted}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-status-warning/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-status-warning/20 flex items-center justify-center font-semibold text-status-warning">
                {topByRating.avatar}
              </div>
              <div>
                <p className="font-medium text-foreground">{topByRating.name}</p>
                <p className="text-xs text-muted-foreground">Best Rating: {topByRating.customerRating}/5</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-status-success/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-status-success/20 flex items-center justify-center font-semibold text-status-success">
                {topByEfficiency.avatar}
              </div>
              <div>
                <p className="font-medium text-foreground">{topByEfficiency.name}</p>
                <p className="text-xs text-muted-foreground">Top Efficiency: {topByEfficiency.efficiency}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Comparison Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Orders by Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="orders" name="Orders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Individual Staff Performance Radar */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Performance Breakdown</CardTitle>
              {selectedStaff && (
                <Badge className={getPositionColor(selectedStaff.position)}>
                  {selectedStaff.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedStaff ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData(selectedStaff)}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <p>Select a staff member below to view breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="bg-card border-border mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStaffPerformance.map((staff) => (
              <button
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  selectedStaff?.id === staff.id
                    ? "bg-primary/10 ring-2 ring-primary/30"
                    : "bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-semibold text-foreground">
                  {staff.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    {staff.trend === "up" && <TrendingUp className="w-4 h-4 text-status-success" />}
                    {staff.trend === "down" && <TrendingDown className="w-4 h-4 text-status-error" />}
                  </div>
                  <Badge className={`${getPositionColor(staff.position)} mt-1`}>
                    {staff.position}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{staff.ordersCompleted}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{staff.customerRating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{staff.efficiency}%</p>
                    <p className="text-xs text-muted-foreground">Efficiency</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPerformance;