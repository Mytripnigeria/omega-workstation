import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";

interface StaffOnShift {
  id: string;
  name: string;
  position: string;
  clockedIn: Date;
  status: "active" | "on-break" | "idle";
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

const mockStaffOnShift: StaffOnShift[] = [
  { id: "s1", name: "John Adeyemi", position: "Kitchen Staff", clockedIn: new Date(Date.now() - 4 * 60 * 60000), status: "active" },
  { id: "s2", name: "Sarah Okonkwo", position: "Waiter", clockedIn: new Date(Date.now() - 3 * 60 * 60000), status: "active" },
  { id: "s3", name: "Michael Bello", position: "Cashier", clockedIn: new Date(Date.now() - 5 * 60 * 60000), status: "on-break" },
  { id: "s4", name: "Amara Eze", position: "Delivery Rider", clockedIn: new Date(Date.now() - 2 * 60 * 60000), status: "active" },
  { id: "s5", name: "David Okoro", position: "Kitchen Staff", clockedIn: new Date(Date.now() - 6 * 60 * 60000), status: "active" },
  { id: "s6", name: "Grace Nwosu", position: "Waiter", clockedIn: new Date(Date.now() - 1 * 60 * 60000), status: "idle" },
];

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

const ManagersPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
      case "active": return "bg-status-success";
      case "on-break": return "bg-status-warning";
      case "idle": return "bg-muted";
      case "normal": return "text-status-success";
      case "busy": return "text-status-warning";
      case "critical": return "text-destructive";
      default: return "bg-secondary";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-status-warning" />;
      default: return <Bell className="w-4 h-4 text-status-info" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-status-warning";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Manager's Dashboard"
        icon={Shield}
        iconColor="text-category-cream"
      />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-category-pink" />
            <span className="text-sm text-muted-foreground">Staff on Shift</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockStaffOnShift.length}</p>
          <p className="text-xs text-muted-foreground">{mockStaffOnShift.filter(s => s.status === "active").length} active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-category-mint" />
            <span className="text-sm text-muted-foreground">Today's Orders</span>
          </div>
          <p className="text-2xl font-bold text-foreground">42</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-status-success" />
            <span className="text-xs text-status-success">+12% vs yesterday</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-category-lavender" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₦124.7k</p>
          <Progress value={75} className="h-1 mt-2" />
          <p className="text-xs text-muted-foreground mt-1">75% of target</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-status-warning" />
            <span className="text-sm text-muted-foreground">Active Alerts</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockAlerts.filter(a => a.type !== "info").length}</p>
          <p className="text-xs text-muted-foreground">{mockAlerts.filter(a => a.type === "error").length} critical</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff ({mockStaffOnShift.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({mockAlerts.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Section Status */}
          <h3 className="text-lg font-semibold text-foreground mb-4">Section Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {mockSectionStatus.map((section) => (
              <div key={section.name} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{section.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(section.status)}>
                    {section.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Orders</span>
                    <span className="font-medium text-foreground">{section.activeOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Wait</span>
                    <span className="font-medium text-foreground">{section.avgWaitTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Alerts Preview */}
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
          <div className="space-y-2 mb-6">
            {mockAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === "error" ? "bg-destructive/5 border-destructive/30" :
                alert.type === "warning" ? "bg-status-warning/5 border-status-warning/30" :
                "bg-secondary/50 border-border"
              }`}>
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.section} • {formatTime(alert.time)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Active Staff Preview */}
          <h3 className="text-lg font-semibold text-foreground mb-4">Staff on Shift</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mockStaffOnShift.map((staff) => (
              <div key={staff.id} className="bg-card border border-border rounded-xl p-3 text-center">
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                  staff.status === "active" ? "bg-status-success" :
                  staff.status === "on-break" ? "bg-status-warning" : "bg-muted"
                }`}>
                  {staff.name.split(" ").map(n => n[0]).join("")}
                </div>
                <p className="text-sm font-medium text-foreground truncate">{staff.name.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">{staff.position}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Staff</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Position</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Time on Shift</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStaffOnShift.map((staff) => (
                    <tr key={staff.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStatusColor(staff.status)}`}>
                            {staff.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-medium text-foreground">{staff.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{staff.position}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`capitalize ${
                          staff.status === "active" ? "border-status-success text-status-success" :
                          staff.status === "on-break" ? "border-status-warning text-status-warning" :
                          "border-muted text-muted-foreground"
                        }`}>
                          {staff.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground">{formatDuration(staff.clockedIn)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div key={task.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {task.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-status-success" />
                    ) : task.status === "in-progress" ? (
                      <Clock className="w-5 h-5 text-status-info" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full ${getPriorityColor(task.priority)}`} />
                    )}
                    <span className={`font-medium ${task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-7">
                  <span>Assigned to: {task.assignee}</span>
                  <span>•</span>
                  <span>Due: {task.dueTime}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
                alert.type === "error" ? "bg-destructive/5 border-destructive/30" :
                alert.type === "warning" ? "bg-status-warning/5 border-status-warning/30" :
                "bg-secondary/50 border-border"
              }`}>
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <p className="text-foreground">{alert.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.section} • {formatTime(alert.time)}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagersPage;