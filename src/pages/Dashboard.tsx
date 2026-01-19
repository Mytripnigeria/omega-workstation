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
  Printer,
} from "lucide-react";
import toastyLogo from "@/assets/toasty-logo.png";
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
  { title: "Expenses", description: "Manage costs", icon: BarChart3, route: "/expenses", color: "text-category-peach" },
  { title: "Printers", description: "Print settings", icon: Printer, route: "/printers", color: "text-category-mint" },
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
      {/* Enterprise Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left - Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
                  <img src={toastyLogo} alt="Toasty" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-card ${
                  isOnline ? 'bg-status-success' : 'bg-status-warning'
                }`} />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm sm:text-base font-semibold text-foreground leading-tight">Toasty POS</h1>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>Makurdi Branch</span>
                </div>
              </div>
            </div>

            {/* Center - Status Bar (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground tabular-nums">{formatTime(currentTime)}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isOnline ? 'bg-status-success/10' : 'bg-status-warning/10'
              }`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-status-success" /> : <WifiOff className="w-3.5 h-3.5 text-status-warning" />}
                <span className={`text-xs font-medium ${isOnline ? 'text-status-success' : 'text-status-warning'}`}>
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center">
              {/* Mobile Time */}
              <div className="flex md:hidden items-center mr-2 px-2 py-1 rounded-md bg-secondary/50">
                <span className="text-xs font-medium text-foreground tabular-nums">{formatTime(currentTime)}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <ThemeToggle />
                <FullscreenToggle />
                <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout} 
                  className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container">
        {/* Welcome & Clock In Section - Refined Layout */}
        <section className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Left - Welcome */}
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Welcome back, {currentStaff?.name}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Right - Position Selector & Clock Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select value={shiftPosition} onValueChange={setShiftPosition}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-secondary/50 border-border">
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
                  size="lg"
                  className={`h-11 rounded-xl px-6 font-medium ${
                    isClockedIn 
                      ? "bg-status-success/15 text-status-success border border-status-success/30 hover:bg-status-success/25" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  variant={isClockedIn ? "outline" : "default"}
                >
                  {isClockedIn ? <LogOutIcon className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </Button>
              </div>
            </div>

            {/* Clock Status Banner */}
            {isClockedIn && clockInTime && (
              <div className="mt-4 bg-status-success/10 border border-status-success/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                  <span className="text-sm text-foreground">
                    Clocked in at <span className="font-semibold">{formatTime(clockInTime)}</span> as {shiftPosition}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowKPI(true)} 
                  className="rounded-lg text-status-success hover:bg-status-success/10"
                >
                  View KPI
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Services Grid - Improved Responsive Layout */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {services.map((service) => (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="bg-card rounded-2xl border border-border p-4 sm:p-5 text-left hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group flex flex-col"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-secondary/60 group-hover:bg-primary/10 transition-colors mb-3">
                  <service.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {service.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
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
