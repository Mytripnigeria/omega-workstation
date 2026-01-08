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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkstationCard from "@/components/WorkstationCard";

interface Staff {
  id: string;
  name: string;
  role: string;
}

const workstations = [
  {
    title: "Counter POS",
    description: "Process orders, payments, and manage the counter register",
    icon: Monitor,
    route: "/pos",
    colorClass: "text-category-mint",
    iconBgClass: "bg-category-mint/20",
  },
  {
    title: "Kitchen Display",
    description: "View and manage incoming orders for kitchen staff",
    icon: ChefHat,
    route: "/kitchen",
    colorClass: "text-category-lavender",
    iconBgClass: "bg-category-lavender/20",
  },
  {
    title: "Waiter Display",
    description: "Take orders tableside and track table status",
    icon: Users,
    route: "/waiter",
    colorClass: "text-category-pink",
    iconBgClass: "bg-category-pink/20",
  },
  {
    title: "Delivery Rider",
    description: "View delivery orders and manage routes",
    icon: Bike,
    route: "/delivery",
    colorClass: "text-category-peach",
    iconBgClass: "bg-category-peach/20",
  },
];

const quickActions = [
  {
    title: "Table Map",
    icon: TableIcon,
    route: "/tables",
    colorClass: "text-category-sky",
    iconBgClass: "bg-category-sky/20",
  },
  {
    title: "Reports",
    icon: BarChart3,
    route: "/reports",
    colorClass: "text-category-sage",
    iconBgClass: "bg-category-sage/20",
  },
  {
    title: "Settings",
    icon: Settings,
    route: "/settings",
    colorClass: "text-category-cream",
    iconBgClass: "bg-category-cream/20",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const staffData = sessionStorage.getItem("currentStaff");
    if (!staffData) {
      navigate("/");
      return;
    }
    setCurrentStaff(JSON.parse(staffData));

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentStaff");
    navigate("/");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Workstation</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, <span className="text-primary font-medium">{currentStaff?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatDate(currentTime)}</span>
            <span className="text-foreground font-medium">{formatTime(currentTime)}</span>
          </div>
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
      </header>

      {/* Main Workstations */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Workstations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workstations.map((station) => (
            <WorkstationCard key={station.title} {...station} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.route)}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.iconBgClass}`}>
                <action.icon className={`w-6 h-6 ${action.colorClass}`} />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Summary */}
      <section className="mt-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today's Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold text-category-mint">£1,247</p>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-category-lavender">42</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-category-pink">8</p>
              <p className="text-sm text-muted-foreground">Active Tables</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-category-peach">5</p>
              <p className="text-sm text-muted-foreground">Pending Deliveries</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
