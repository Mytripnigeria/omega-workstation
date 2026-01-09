import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  ChefHat,
  Users,
  Bike,
  BarChart3,
  Settings,
  TableIcon,
  LogOut,
  Clock,
  Target,
  Package,
  ClipboardCheck,
  Calendar,
  User,
  MapPin,
  LogIn,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WorkstationCard from "@/components/WorkstationCard";
import ThemeToggle from "@/components/ThemeToggle";
import FullscreenToggle from "@/components/FullscreenToggle";
import KPIModal from "@/components/KPIModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Staff {
  id: string;
  name: string;
  role: string;
}

const workstations = [
  { title: "Counter POS", description: "Process orders and payments", icon: Monitor, route: "/pos", colorClass: "text-category-mint", iconBgClass: "bg-category-mint" },
  { title: "Kitchen Display", description: "Manage incoming orders", icon: ChefHat, route: "/kitchen", colorClass: "text-category-lavender", iconBgClass: "bg-category-lavender" },
  { title: "Waiter Display", description: "Take orders tableside", icon: Users, route: "/waiter", colorClass: "text-category-pink", iconBgClass: "bg-category-pink" },
  { title: "Delivery Rider", description: "View delivery orders", icon: Bike, route: "/delivery", colorClass: "text-category-peach", iconBgClass: "bg-category-peach" },
  { title: "Order Lobby", description: "Customer waiting display", icon: Users, route: "/lobby", colorClass: "text-category-sky", iconBgClass: "bg-category-sky" },
  { title: "Instore", description: "Manage inventory", icon: Package, route: "/instore", colorClass: "text-category-sage", iconBgClass: "bg-category-sage" },
  { title: "Outstore", description: "Kitchen inventory", icon: Package, route: "/outstore", colorClass: "text-category-coral", iconBgClass: "bg-category-coral" },
  { title: "Checklist", description: "Shift tasks", icon: ClipboardCheck, route: "/checklist", colorClass: "text-category-lavender", iconBgClass: "bg-category-lavender" },
];

const quickActions = [
  { title: "My Shifts", icon: Calendar, route: "/shifts", colorClass: "text-category-sky", iconBgClass: "bg-category-sky" },
  { title: "Profile", icon: User, route: "/profile", colorClass: "text-category-pink", iconBgClass: "bg-category-pink" },
  { title: "Reports", icon: BarChart3, route: "/reports", colorClass: "text-category-sage", iconBgClass: "bg-category-sage" },
  { title: "Settings", icon: Settings, route: "/settings", colorClass: "text-category-cream", iconBgClass: "bg-category-cream" },
];

const shiftPositions = ["Kitchen Staff", "Waiter", "Cashier", "Delivery Rider", "Supervisor"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showKPI, setShowKPI] = useState(false);
  const [shiftPosition, setShiftPosition] = useState("Kitchen Staff");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: () => void; title: string; description: string }>({
    open: false, action: () => {}, title: "", description: ""
  });

  useEffect(() => {
    const staffData = sessionStorage.getItem("currentStaff");
    if (!staffData) { navigate("/"); return; }
    setCurrentStaff(JSON.parse(staffData));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    setConfirmDialog({
      open: true,
      title: "Sign Out",
      description: "Are you sure you want to sign out?",
      action: () => {
        sessionStorage.removeItem("currentStaff");
        navigate("/");
      }
    });
  };

  const handleClockToggle = () => {
    if (isClockedIn) {
      setConfirmDialog({
        open: true, title: "Clock Out", description: "Are you sure you want to clock out?",
        action: () => { setIsClockedIn(false); setClockInTime(null); }
      });
    } else {
      setIsClockedIn(true);
      setClockInTime(new Date());
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="w-3 h-3" />
            <span>Mr. Jollof - Makurdi</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Workstation</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Welcome, <span className="text-primary font-medium">{currentStaff?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={shiftPosition} onValueChange={setShiftPosition}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shiftPositions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant={isClockedIn ? "outline" : "default"} onClick={handleClockToggle} className={isClockedIn ? "" : "gradient-primary"}>
            {isClockedIn ? <LogOutIcon className="w-4 h-4 mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-foreground font-medium text-sm">{formatTime(currentTime)}</span>
          </div>
          <ThemeToggle />
          <FullscreenToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Clock Status & KPI */}
      {isClockedIn && clockInTime && (
        <div className="bg-status-success/10 border border-status-success/30 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-sm text-foreground">Clocked in at {formatTime(clockInTime)} as {shiftPosition}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowKPI(true)}>
            <Target className="w-4 h-4 mr-1" /> View KPI
          </Button>
        </div>
      )}

      {/* Workstations */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Workstations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {workstations.map((station) => (
            <WorkstationCard key={station.title} {...station} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button key={action.title} onClick={() => navigate(action.route)} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/50 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.iconBgClass}`}>
                <action.icon className={`w-5 h-5 ${action.colorClass}`} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-base font-semibold text-foreground mb-3">Today's Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><p className="text-2xl font-bold text-category-mint">₦124,700</p><p className="text-xs text-muted-foreground">Total Sales</p></div>
            <div><p className="text-2xl font-bold text-category-lavender">42</p><p className="text-xs text-muted-foreground">Orders</p></div>
            <div><p className="text-2xl font-bold text-category-pink">8</p><p className="text-xs text-muted-foreground">Active Tables</p></div>
            <div><p className="text-2xl font-bold text-category-peach">5</p><p className="text-xs text-muted-foreground">Deliveries</p></div>
          </div>
        </div>
      </section>

      <KPIModal open={showKPI} onClose={() => setShowKPI(false)} />
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
    </div>
  );
};

export default Dashboard;
