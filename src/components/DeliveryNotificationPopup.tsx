import { useState, useEffect } from "react";
import { Bike, MapPin, Package, X, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBeepSound } from "@/hooks/useBeepSound";

interface DeliveryNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  items: number;
  total: number;
  distance: string;
  timestamp: Date;
}

interface DeliveryNotificationPopupProps {
  notification: DeliveryNotification | null;
  onDismiss: () => void;
  onAccept: () => void;
}

const DeliveryNotificationPopup = ({
  notification,
  onDismiss,
  onAccept,
}: DeliveryNotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const playBeep = useBeepSound();

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  // Continuous beep until dismissed
  useEffect(() => {
    if (!notification) return;
    
    // Play initial beep
    playBeep();
    
    // Continue beeping every 2 seconds
    const beepInterval = setInterval(() => {
      playBeep();
    }, 2000);

    return () => clearInterval(beepInterval);
  }, [notification, playBeep]);

  if (!notification || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 bg-card border-2 border-primary rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-pulse">
              <Bike className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-foreground">New Delivery!</h3>
              <p className="text-sm text-primary-foreground/80">{notification.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-lg">{notification.customerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="rounded-lg">
                  <Package className="w-3 h-3 mr-1" />
                  {notification.items} items
                </Badge>
                <Badge variant="outline" className="rounded-lg">
                  <MapPin className="w-3 h-3 mr-1" />
                  {notification.distance}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">₦{notification.total.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{notification.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Just now</span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="h-12 rounded-xl"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleAccept}
              className="h-12 rounded-xl"
            >
              <Bike className="w-4 h-4 mr-2" />
              Accept Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNotificationPopup;
