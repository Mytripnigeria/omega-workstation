import { Target, Clock, TrendingUp, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface KPIModalProps {
  open: boolean;
  onClose: () => void;
}

const KPIModal = ({ open, onClose }: KPIModalProps) => {
  const kpis = [
    {
      label: "Daily Orders Target",
      current: 42,
      target: 50,
      unit: "orders",
      icon: Target,
      color: "text-category-mint",
    },
    {
      label: "Average Speed",
      current: 8.5,
      target: 10,
      unit: "min",
      icon: Clock,
      color: "text-category-lavender",
      isLowerBetter: true,
    },
    {
      label: "Current Speed",
      current: 7.2,
      target: 10,
      unit: "min",
      icon: Zap,
      color: "text-category-peach",
      isLowerBetter: true,
    },
    {
      label: "Revenue Target",
      current: 124700,
      target: 150000,
      unit: "₦",
      icon: TrendingUp,
      color: "text-category-pink",
      isCurrency: true,
    },
  ];

  const formatValue = (value: number, isCurrency?: boolean) => {
    if (isCurrency) {
      return `₦${value.toLocaleString()}`;
    }
    return value.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily KPI Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {kpis.map((kpi) => {
            const percentage = kpi.isLowerBetter
              ? Math.min(100, ((kpi.target - kpi.current + kpi.target) / (kpi.target * 2)) * 100)
              : Math.min(100, (kpi.current / kpi.target) * 100);
            
            const isOnTrack = kpi.isLowerBetter
              ? kpi.current <= kpi.target
              : kpi.current >= kpi.target * 0.8;

            return (
              <div key={kpi.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-sm font-medium text-foreground">{kpi.label}</span>
                  </div>
                  <span className={`text-xs font-medium ${isOnTrack ? "text-status-success" : "text-status-warning"}`}>
                    {isOnTrack ? "On Track" : "Behind"}
                  </span>
                </div>
                
                <Progress value={percentage} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-semibold">
                    {kpi.isCurrency ? formatValue(kpi.current, true) : `${kpi.current} ${kpi.unit}`}
                  </span>
                  <span className="text-muted-foreground">
                    Target: {kpi.isCurrency ? formatValue(kpi.target, true) : `${kpi.target} ${kpi.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KPIModal;
