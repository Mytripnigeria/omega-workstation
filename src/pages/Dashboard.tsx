import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  ChefHat,
  Users,
  Bike,
  BarChart3,
  Package,
  ClipboardCheck,
  Calendar,
  User,
  LogIn,
  LogOutIcon,
  Shield,
  Wifi,
  WifiOff,
  Clock,
  ChevronRight,
  MapPin,
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
  color: string;
}

const services: ServiceItem[] = [
  { title: "Counter POS", description: "Process orders", icon: Monitor, route: "/pos", color: "text-category-mint" },
  { title: "Kitchen", description: "Manage orders", icon: ChefHat, route: "/kitchen", color: "text-category-lavender" },
  { title: "Waiter", description: "Serve ready orders", icon: Users, route: "/waiter", color: "text-category-pink" },
  { title: "Delivery", description: "Rider view", icon: Bike, route: "/delivery", color: "text-category-peach" },
  { title: "Lobby", description: "Customer queue", icon: Users, route: "/lobby", color: "text-category-sky" },
  { title: "Instore", description: "Store inventory", icon: Package, route: "/instore", color: "text-category-sage" },
  { title: "Outstore", description: "Kitchen inventory", icon: Package, route: "/outstore", color: "text-category-coral" },
  { title: "Checklist", description: "Shift tasks", icon: ClipboardCheck, route: "/checklist", color: "text-category-lavender" },
  { title: "Shifts", description: "Your schedule", icon: Calendar, route: "/shifts", color: "text-category-sky" },
  { title: "Profile", description: "Work profile", icon: User, route: "/profile", color: "text-category-pink" },
  { title: "Reports", description: "Analytics", icon: BarChart3, route: "/reports", color: "text-category-sage" },
  { title: "Managers", description: "Overview", icon: Shield, route: "/managers", color: "text-category-cream" },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo & Location */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Mr. Jollof</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>Makurdi Branch</span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    isOnline ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
                  }`}>
                    {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-foreground">{formatTime(currentTime)}</span>
              </div>
              <ThemeToggle />
              <FullscreenToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOutIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Welcome & Clock In */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, {currentStaff?.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={shiftPosition} onValueChange={setShiftPosition}>
                <SelectTrigger className="w-[160px] h-10 rounded-xl bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftPositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleClockToggle} 
                className={`h-10 rounded-xl px-5 ${
                  isClockedIn 
                    ? "bg-status-success/10 text-status-success border border-status-success/30 hover:bg-status-success/20" 
                    : ""
                }`}
                variant={isClockedIn ? "outline" : "default"}
              >
                {isClockedIn ? <LogOutIcon className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                {isClockedIn ? "Clock Out" : "Clock In"}
              </Button>
            </div>
          </div>

          {/* Clock Status */}
          {isClockedIn && clockInTime && (
            <div className="bg-status-success/10 border border-status-success/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                <span className="text-sm text-foreground">
                  Clocked in at <span className="font-semibold">{formatTime(clockInTime)}</span> as {shiftPosition}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowKPI(true)} 
                className="rounded-xl border-status-success/30 text-status-success hover:bg-status-success/10"
              >
                View KPI
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">₦124,700</p>
              <p className="text-sm text-muted-foreground mt-1">Today's Sales</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">42</p>
              <p className="text-sm text-muted-foreground mt-1">Orders</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">8</p>
              <p className="text-sm text-muted-foreground mt-1">Active Tables</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">5</p>
              <p className="text-sm text-muted-foreground mt-1">Deliveries</p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {services.map((service) => (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="bg-card rounded-2xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-muted ${service.color}`}>
                  <service.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {service.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      <KPIModal open={showKPI} onClose={() => setShowKPI(false)} />
      <ConfirmDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} 
        title={confirmDialog.title} 
        description={confirmDialog.description} 
        onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} 
      />
    </div>
  );
};

export default Dashboard;
