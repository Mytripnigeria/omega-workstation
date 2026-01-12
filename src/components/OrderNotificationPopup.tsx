import { useEffect } from "react";
import { Globe, Smartphone, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderNotification {
  id: string;
  orderNumber: string;
  source: "ubereats" | "deliveroo" | "website" | "selfservice";
  customerName: string;
  itemCount: number;
  total: number;
  timestamp: Date;
}

interface OrderNotificationPopupProps {
  notification: OrderNotification | null;
  onDismiss: () => void;
  onViewOrder: () => void;
}

const OrderNotificationPopup = ({ notification, onDismiss, onViewOrder }: OrderNotificationPopupProps) => {
  useEffect(() => {
    if (notification) {
      // Play notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gainNode.gain.value = 0.4;
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      playTone(880, 0, 0.15);
      playTone(1100, 0.2, 0.15);
      playTone(880, 0.4, 0.15);
    }
  }, [notification]);

  if (!notification) return null;

  const getSourceIcon = (source: OrderNotification["source"]) => {
    switch (source) {
      case "ubereats":
      case "deliveroo":
        return <Smartphone className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSourceName = (source: OrderNotification["source"]) => {
    switch (source) {
      case "ubereats": return "Uber Eats";
      case "deliveroo": return "Deliveroo";
      case "website": return "Website";
      case "selfservice": return "Self Service";
    }
  };

  const getSourceColor = (source: OrderNotification["source"]) => {
    switch (source) {
      case "ubereats": return "bg-green-500";
      case "deliveroo": return "bg-cyan-500";
      case "website": return "bg-status-info";
      default: return "bg-status-warning";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-5 w-80">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${getSourceColor(notification.source)} flex items-center justify-center text-white`}>
              {getSourceIcon(notification.source)}
            </div>
            <div>
              <p className="font-semibold text-foreground">New Order!</p>
              <Badge variant="outline" className="text-xs mt-0.5 rounded-lg">
                {getSourceName(notification.source)}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="rounded-lg h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Order Details */}
        <div className="bg-secondary/50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">{notification.orderNumber}</span>
            <span className="font-bold text-primary">₦{notification.total.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.customerName} • {notification.itemCount} items
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onDismiss}>
            Dismiss
          </Button>
          <Button className="flex-1 rounded-xl" onClick={onViewOrder}>
            View Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderNotificationPopup;
