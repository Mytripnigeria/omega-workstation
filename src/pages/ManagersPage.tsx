import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Clock,
  ShoppingCart,
  ChefHat,
  Bike,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Target,
  Zap,
  DollarSign,
  Activity,
  PieChart,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
  ArrowLeft,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import ActivityLog from "@/components/ActivityLog";
import ActivityLogButton from "@/components/ActivityLogButton";

interface StaffOnShift {
  id: string;
  name: string;
  position: string;
  section: "kitchen" | "floor" | "counter" | "delivery";
  clockedIn: Date;
  status: "active" | "on-break" | "idle";
  ordersCompleted?: number;
  avgServiceTime?: string;
  rating?: number;
  schedule: { start: number; end: number }; // hours 0-24
  breaks: { start: number; end: number }[];
  onTaskTime: number; // percentage
  offTaskTime: number; // percentage
}

interface StaffActivity {
  id: string;
  action: string;
  time: Date;
  details?: string;
}

interface SectionStatus {
  name: string;
  icon: React.ElementType;
  activeOrders: number;
  status: "normal" | "busy" | "critical";
  avgWaitTime: string;
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  time: Date;
  section: string;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueTime: string;
}

interface Metric {
  id: string;
  name: string;
  value: string;
  change: number;
  changeLabel: string;
  category: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
}

const mockStaffOnShift: StaffOnShift[] = [
  { id: "s1", name: "John Adeyemi", position: "Kitchen Staff", section: "kitchen", clockedIn: new Date(Date.now() - 4 * 60 * 60000), status: "active", ordersCompleted: 23, avgServiceTime: "8 min", rating: 4.8, schedule: { start: 6, end: 14 }, breaks: [{ start: 10, end: 10.25 }], onTaskTime: 85, offTaskTime: 15 },
  { id: "s2", name: "Sarah Okonkwo", position: "Waiter", section: "floor", clockedIn: new Date(Date.now() - 3 * 60 * 60000), status: "active", ordersCompleted: 18, avgServiceTime: "3 min", rating: 4.9, schedule: { start: 8, end: 16 }, breaks: [{ start: 12, end: 12.5 }], onTaskTime: 92, offTaskTime: 8 },
  { id: "s3", name: "Michael Bello", position: "Cashier", section: "counter", clockedIn: new Date(Date.now() - 5 * 60 * 60000), status: "on-break", ordersCompleted: 42, avgServiceTime: "2 min", rating: 4.6, schedule: { start: 6, end: 14 }, breaks: [{ start: 10, end: 10.5 }, { start: 13, end: 13.25 }], onTaskTime: 78, offTaskTime: 22 },
  { id: "s4", name: "Amara Eze", position: "Delivery Rider", section: "delivery", clockedIn: new Date(Date.now() - 2 * 60 * 60000), status: "active", ordersCompleted: 8, avgServiceTime: "25 min", rating: 4.7, schedule: { start: 10, end: 18 }, breaks: [{ start: 14, end: 14.5 }], onTaskTime: 88, offTaskTime: 12 },
  { id: "s5", name: "David Okoro", position: "Kitchen Staff", section: "kitchen", clockedIn: new Date(Date.now() - 6 * 60 * 60000), status: "active", ordersCompleted: 31, avgServiceTime: "7 min", rating: 4.5, schedule: { start: 6, end: 14 }, breaks: [{ start: 9, end: 9.25 }], onTaskTime: 90, offTaskTime: 10 },
  { id: "s6", name: "Grace Nwosu", position: "Waiter", section: "floor", clockedIn: new Date(Date.now() - 1 * 60 * 60000), status: "idle", ordersCompleted: 5, avgServiceTime: "4 min", rating: 4.4, schedule: { start: 12, end: 20 }, breaks: [], onTaskTime: 70, offTaskTime: 30 },
];

const mockStaffActivities: Record<string, StaffActivity[]> = {
  s1: [
    { id: "a1", action: "Completed order #ORD042", time: new Date(Date.now() - 5 * 60000), details: "Jollof Rice (L) x2, Chicken x2" },
    { id: "a2", action: "Started preparing order #ORD043", time: new Date(Date.now() - 8 * 60000) },
    { id: "a3", action: "Took 15 min break", time: new Date(Date.now() - 60 * 60000) },
    { id: "a4", action: "Completed order #ORD038", time: new Date(Date.now() - 90 * 60000), details: "Fried Rice (M) x3" },
    { id: "a5", action: "Clocked in", time: new Date(Date.now() - 4 * 60 * 60000) },
  ],
  s2: [
    { id: "a1", action: "Served Table 5", time: new Date(Date.now() - 3 * 60000) },
    { id: "a2", action: "Took order from Table 8", time: new Date(Date.now() - 10 * 60000) },
    { id: "a3", action: "Cleared Table 3", time: new Date(Date.now() - 25 * 60000) },
  ],
};

const mockSectionStatus: SectionStatus[] = [
  { name: "Kitchen", icon: ChefHat, activeOrders: 8, status: "busy", avgWaitTime: "12 min" },
  { name: "Counter POS", icon: ShoppingCart, activeOrders: 3, status: "normal", avgWaitTime: "2 min" },
  { name: "Delivery", icon: Bike, activeOrders: 5, status: "normal", avgWaitTime: "25 min" },
  { name: "Inventory", icon: Package, activeOrders: 0, status: "normal", avgWaitTime: "-" },
];

const mockAlerts: Alert[] = [
  { id: "a1", type: "warning", message: "Kitchen prep time exceeding target (15 min avg)", time: new Date(Date.now() - 5 * 60000), section: "Kitchen" },
  { id: "a2", type: "error", message: "Low stock alert: Tomatoes below minimum (8 kg remaining)", time: new Date(Date.now() - 15 * 60000), section: "Inventory" },
  { id: "a3", type: "info", message: "Delivery rider David has completed 5 orders today", time: new Date(Date.now() - 30 * 60000), section: "Delivery" },
  { id: "a4", type: "warning", message: "3 orders delayed in kitchen", time: new Date(Date.now() - 10 * 60000), section: "Kitchen" },
];

const mockTasks: Task[] = [
  { id: "t1", title: "Restock tomatoes from Store Room 1", assignee: "John A.", status: "pending", priority: "high", dueTime: "ASAP" },
  { id: "t2", title: "Clean prep station", assignee: "Sarah O.", status: "in-progress", priority: "medium", dueTime: "Before 3 PM" },
  { id: "t3", title: "Update menu prices", assignee: "Michael B.", status: "completed", priority: "low", dueTime: "End of day" },
  { id: "t4", title: "Check freezer temperature", assignee: "David O.", status: "pending", priority: "medium", dueTime: "Every 2 hours" },
];

const mockMetrics: Metric[] = [
  { id: "m1", name: "Total Revenue", value: "₦124,700", change: 12, changeLabel: "vs yesterday", category: "Sales", icon: DollarSign, trend: "up" },
  { id: "m2", name: "Average Order Value", value: "₦2,969", change: 5, changeLabel: "vs yesterday", category: "Sales", icon: ShoppingCart, trend: "up" },
  { id: "m3", name: "Orders Today", value: "42", change: 8, changeLabel: "vs yesterday", category: "Sales", icon: ShoppingCart, trend: "up" },
  { id: "m9", name: "Avg Prep Time", value: "8.5 min", change: -12, changeLabel: "vs target 10 min", category: "Efficiency", icon: Clock, trend: "up" },
  { id: "m10", name: "Avg Wait Time", value: "12 min", change: 5, changeLabel: "vs yesterday", category: "Efficiency", icon: Clock, trend: "down" },
  { id: "m17", name: "Staff on Shift", value: "6", change: 0, changeLabel: "of 8 scheduled", category: "Staff", icon: Users, trend: "neutral" },
  { id: "m23", name: "Customer Satisfaction", value: "4.7/5", change: 3, changeLabel: "vs last week", category: "Customer", icon: Star, trend: "up" },
  { id: "m29", name: "Low Stock Items", value: "3", change: 50, changeLabel: "need reorder", category: "Inventory", icon: Package, trend: "down" },
];

const ManagersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStaff, setSelectedStaff] = useState<StaffOnShift | null>(null);
  const [insightCategory, setInsightCategory] = useState("all");
  const [showActivityLog, setShowActivityLog] = useState(false);

  const formatDuration = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (60 * 60000));
    const mins = Math.floor(((Date.now() - date.getTime()) % (60 * 60000)) / 60000);
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "on-break": return "bg-amber-100 text-amber-700";
      case "idle": return "bg-gray-100 text-gray-600";
      case "normal": return "text-green-600";
      case "busy": return "text-amber-600";
      case "critical": return "text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case "error": return "bg-red-50 border-red-200";
      case "warning": return "bg-amber-50 border-amber-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="w-5 h-5 text-foreground" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-foreground" />;
      default: return <Bell className="w-5 h-5 text-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="w-3 h-3" />;
      case "down": return <ArrowDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === "neutral") return "text-gray-500";
    if (change < 0 && trend === "up") return "text-green-600";
    if (change > 0 && trend === "down") return "text-red-600";
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "kitchen": return ChefHat;
      case "floor": return Utensils;
      case "counter": return ShoppingCart;
      case "delivery": return Bike;
      default: return Users;
    }
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case "kitchen": return "Kitchen";
      case "floor": return "Floor Service";
      case "counter": return "Counter";
      case "delivery": return "Delivery";
      default: return section;
    }
  };

  const handleStaffClick = (staff: StaffOnShift) => {
    setSelectedStaff(staff);
  };

  const metricCategories = ["all", ...new Set(mockMetrics.map(m => m.category))];
  const filteredMetrics = insightCategory === "all" 
    ? mockMetrics 
    : mockMetrics.filter(m => m.category === insightCategory);

  // Group staff by section
  const staffBySection = mockStaffOnShift.reduce((acc, staff) => {
    if (!acc[staff.section]) acc[staff.section] = [];
    acc[staff.section].push(staff);
    return acc;
  }, {} as Record<string, StaffOnShift[]>);

  const currentHour = new Date().getHours();

  // Time Coverage Component
  const TimeCoverageBar = ({ staff }: { staff: StaffOnShift }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="mt-3">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <span>6AM</span>
          <span className="flex-1" />
          <span>12PM</span>
          <span className="flex-1" />
          <span>6PM</span>
          <span className="flex-1" />
          <span>12AM</span>
        </div>
        <div className="flex h-6 rounded-lg overflow-hidden border border-border">
          {hours.map((hour) => {
            const isScheduled = hour >= staff.schedule.start && hour < staff.schedule.end;
            const isBreak = staff.breaks.some(b => hour >= b.start && hour < b.end);
            const isCurrent = hour === currentHour;
            
            let bgColor = "bg-muted/30";
            if (isScheduled) bgColor = "bg-status-success/70";
            if (isBreak) bgColor = "bg-status-warning/70";
            
            return (
              <div 
                key={hour} 
                className={`flex-1 ${bgColor} ${isCurrent ? "ring-2 ring-primary ring-inset" : ""}`}
                title={`${hour}:00 - ${isBreak ? "Break" : isScheduled ? "Working" : "Off"}`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-status-success/70" />
            <span className="text-muted-foreground">On Task ({staff.onTaskTime}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-status-warning/70" />
            <span className="text-muted-foreground">Break/Off ({staff.offTaskTime}%)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Manager Dashboard</h1>
                <p className="text-sm text-muted-foreground">Operations overview and insights</p>
              </div>
            </div>
          </div>
          <ActivityLogButton onClick={() => setShowActivityLog(true)} />
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Staff on Shift</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{mockStaffOnShift.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{mockStaffOnShift.filter(s => s.status === "active").length} active</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Today's Orders</span>
            </div>
            <p className="text-3xl font-bold text-foreground">42</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+12% vs yesterday</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-foreground">₦124.7k</p>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">75% of target</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Active Alerts</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{mockAlerts.filter(a => a.type !== "info").length}</p>
            <p className="text-sm text-red-600 mt-1">{mockAlerts.filter(a => a.type === "error").length} critical</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card">Overview</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-card">Staff ({mockStaffOnShift.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-card">Tasks</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-card">Alerts ({mockAlerts.length})</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-card">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Section Status */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Section Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockSectionStatus.map((section) => (
                  <div key={section.name} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <section.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{section.name}</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(section.status)}`}>
                        {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{section.activeOrders} active orders</span>
                      <span className="text-muted-foreground">{section.avgWaitTime} avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {mockAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`border rounded-2xl p-4 ${getAlertBg(alert.type)}`}>
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="rounded-lg">{alert.section}</Badge>
                          <span>{formatTime(alert.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Staff Tab - Grouped by Section */}
          <TabsContent value="staff" className="mt-6">
            <div className="space-y-8">
              {Object.entries(staffBySection).map(([section, staffList]) => {
                const SectionIcon = getSectionIcon(section);
                return (
                  <div key={section}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <SectionIcon className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{getSectionName(section)}</h3>
                      <Badge variant="outline" className="rounded-lg">{staffList.length} staff</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {staffList.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => handleStaffClick(staff)}
                          className={`bg-card border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                            selectedStaff?.id === staff.id 
                              ? "border-primary ring-2 ring-primary/10" 
                              : "border-border hover:border-primary/30 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                                <span className="text-lg font-semibold text-foreground">
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.position}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(staff.status)} rounded-lg`}>
                              {staff.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-foreground">{staff.ordersCompleted}</p>
                              <p className="text-xs text-muted-foreground">Orders</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-foreground">{staff.avgServiceTime}</p>
                              <p className="text-xs text-muted-foreground">Avg Time</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-1">
                                <Star className="w-3 h-3 text-foreground" />
                                {staff.rating}
                              </p>
                              <p className="text-xs text-muted-foreground">Rating</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-foreground" />
                            <span>On shift for {formatDuration(staff.clockedIn)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-6">
            <div className="space-y-3">
              {mockTasks.map((task) => (
                <div key={task.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getPriorityBadge(task.priority)} rounded-lg`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`${getStatusBadge(task.status)} rounded-lg`}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-foreground" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-foreground" />
                          <span>{task.dueTime}</span>
                        </div>
                      </div>
                    </div>
                    {task.status === "completed" && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-2xl p-5 ${getAlertBg(alert.type)}`}>
                  <div className="flex items-start gap-4">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="rounded-lg">{alert.section}</Badge>
                        <span>{formatTime(alert.time)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Eye className="w-4 h-4 text-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {metricCategories.map((category) => (
                <Button
                  key={category}
                  variant={insightCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInsightCategory(category)}
                  className="rounded-xl capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <metric.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <Badge variant="outline" className="rounded-lg text-xs">
                      {metric.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{metric.value}</p>
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend, metric.change)}`}>
                    {getTrendIcon(metric.trend)}
                    <span>{Math.abs(metric.change)}% {metric.changeLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Details Bottom Container */}
      {selectedStaff && (
        <div className="border-t border-border bg-card shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="p-4 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-xl font-semibold text-foreground">
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedStaff.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStaff.position} • {getSectionName(selectedStaff.section)}</p>
                </div>
                <Badge className={`${getStatusColor(selectedStaff.status)} rounded-lg ml-2`}>
                  {selectedStaff.status}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedStaff(null)} className="rounded-lg">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStaff.ordersCompleted}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStaff.avgServiceTime}</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-foreground" />
                    {selectedStaff.rating}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Time Coverage Diagram */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-foreground mb-2">Today's Coverage</h4>
                <TimeCoverageBar staff={selectedStaff} />
              </div>
            </div>

            {/* Activity Log */}
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3">Recent Activity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(mockStaffActivities[selectedStaff.id] || []).slice(0, 4).map((activity) => (
                  <div key={activity.id} className="bg-secondary/30 rounded-xl p-3">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{activity.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{formatTime(activity.time)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Info */}
            <div className="flex items-center justify-between mt-4 p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-foreground" />
                <span className="text-sm text-muted-foreground">On shift for</span>
                <span className="font-semibold text-foreground">{formatDuration(selectedStaff.clockedIn)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scheduled:</span>
                <span className="font-medium text-foreground">{selectedStaff.schedule.start}:00 - {selectedStaff.schedule.end}:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <ActivityLog 
        open={showActivityLog} 
        onClose={() => setShowActivityLog(false)} 
        pageName="Managers Dashboard" 
      />
    </div>
  );
};

export default ManagersPage;
