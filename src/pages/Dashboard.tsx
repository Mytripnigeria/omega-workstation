import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  ChefHat,
  Users,
  Bike,
  BarChart3,
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
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  colorClass: string;
  iconBgClass: string;
}

const services: ServiceItem[] = [
  { title: "Counter POS", description: "Process orders and payments", icon: Monitor, route: "/pos", colorClass: "text-category-mint", iconBgClass: "bg-category-mint" },
  { title: "Kitchen Display", description: "Manage incoming orders", icon: ChefHat, route: "/kitchen", colorClass: "text-category-lavender", iconBgClass: "bg-category-lavender" },
  { title: "Waiter Display", description: "Serve ready orders", icon: Users, route: "/waiter", colorClass: "text-category-pink", iconBgClass: "bg-category-pink" },
  { title: "Delivery Rider", description: "View delivery orders", icon: Bike, route: "/delivery", colorClass: "text-category-peach", iconBgClass: "bg-category-peach" },
  { title: "Order Lobby", description: "Customer waiting display", icon: Users, route: "/lobby", colorClass: "text-category-sky", iconBgClass: "bg-category-sky" },
  { title: "Instore", description: "Manage store inventory", icon: Package, route: "/instore", colorClass: "text-category-sage", iconBgClass: "bg-category-sage" },
  { title: "Outstore", description: "Kitchen inventory", icon: Package, route: "/outstore", colorClass: "text-category-coral", iconBgClass: "bg-category-coral" },
  { title: "Checklist", description: "Shift tasks & duties", icon: ClipboardCheck, route: "/checklist", colorClass: "text-category-lavender", iconBgClass: "bg-category-lavender" },
  { title: "My Shifts", description: "View your schedule", icon: Calendar, route: "/shifts", colorClass: "text-category-sky", iconBgClass: "bg-category-sky" },
  { title: "Profile", description: "Your work profile", icon: User, route: "/profile", colorClass: "text-category-pink", iconBgClass: "bg-category-pink" },
  { title: "Reports", description: "Performance & analytics", icon: BarChart3, route: "/reports", colorClass: "text-category-sage", iconBgClass: "bg-category-sage" },
  { title: "Managers", description: "Overview & controls", icon: Shield, route: "/managers", colorClass: "text-category-cream", iconBgClass: "bg-category-cream" },
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: () => void; title: string; description: string }>({
    open: false, action: () => {}, title: "", description: ""
  });

  useEffect(() => {
    const staffData = sessionStorage.getItem("currentStaff");
    if (!staffData) { navigate("/"); return; }
    setCurrentStaff(JSON.parse(staffData));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
        {/* Header */}
        <header className="mb-6">
          {/* Top Row - Location, Time & Sync Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Mr. Jollof - Makurdi</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                isOnline ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Synced' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-foreground font-medium text-sm">{formatTime(currentTime)}</span>
              </div>
              <ThemeToggle />
              <FullscreenToggle />
            </div>
          </div>

          {/* Welcome & Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Workstation</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome, <span className="text-primary font-semibold">{currentStaff?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={shiftPosition} onValueChange={setShiftPosition}>
                <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftPositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant={isClockedIn ? "outline" : "default"} onClick={handleClockToggle} className={isClockedIn ? "border-status-success text-status-success hover:bg-status-success/10" : "gradient-primary"}>
                {isClockedIn ? <LogOutIcon className="w-4 h-4 mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
                {isClockedIn ? "Clock Out" : "Clock In"}
              </Button>
            </div>
          </div>
        </header>

        {/* Clock Status & KPI */}
        {isClockedIn && clockInTime && (
          <div className="bg-status-success/10 border border-status-success/30 rounded-xl p-3 mb-6 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span className="text-sm text-foreground">Clocked in at {formatTime(clockInTime)} as {shiftPosition}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowKPI(true)} className="border-status-success/50 text-status-success hover:bg-status-success/10">
              <Target className="w-4 h-4 mr-1" /> View KPI
            </Button>
          </div>
        )}

        {/* Stats Summary */}
        <section className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase text-muted-foreground">Today's Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-category-mint">₦124,700</p>
                <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-category-lavender">42</p>
                <p className="text-xs text-muted-foreground mt-1">Orders</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-category-pink">8</p>
                <p className="text-xs text-muted-foreground mt-1">Active Tables</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-category-peach">5</p>
                <p className="text-xs text-muted-foreground mt-1">Deliveries</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid - Enterprise Grade */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase">Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {services.map((service) => (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="bg-card border border-border rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary/50 hover:shadow-lg transition-all group min-h-[120px] text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.iconBgClass}`}>
                  <service.icon className={`w-5 h-5 ${service.colorClass}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-left">{service.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 text-left">{service.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer - Sign In Quick Access (Only on Dashboard) */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border p-3 flex justify-center gap-3 safe-area-bottom z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <KPIModal open={showKPI} onClose={() => setShowKPI(false)} />
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
    </div>
  );
};

export default Dashboard;
