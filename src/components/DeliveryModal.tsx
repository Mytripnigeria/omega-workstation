import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Navigation, CheckCircle2, Package, Clock } from "lucide-react";

interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  status: "pending" | "picked_up" | "on_the_way" | "delivered";
  estimatedTime: string;
  distance: string;
  riderName?: string;
  pickupTime?: string;
  notes?: string;
}

interface DeliveryModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: DeliveryOrder["status"]) => void;
}

const DeliveryModal = ({ delivery, onClose, onUpdateStatus }: DeliveryModalProps) => {
  if (!delivery) return null;

  const getStatusColor = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-status-warning text-foreground";
      case "picked_up":
        return "bg-status-info text-white";
      case "on_the_way":
        return "bg-status-process text-white";
      case "delivered":
        return "bg-status-success text-white";
    }
  };

  const getStatusLabel = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending":
        return "Awaiting Pickup";
      case "picked_up":
        return "Picked Up";
      case "on_the_way":
        return "On The Way";
      case "delivered":
        return "Delivered";
    }
  };

  const getNextAction = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Pick Up Order", next: "picked_up" as const };
      case "picked_up":
        return { label: "Start Delivery", next: "on_the_way" as const };
      case "on_the_way":
        return { label: "Mark Delivered", next: "delivered" as const };
      default:
        return null;
    }
  };

  const nextAction = getNextAction(delivery.status);

  return (
    <Dialog open={!!delivery} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order {delivery.id}</span>
            <Badge className={getStatusColor(delivery.status)}>
              {getStatusLabel(delivery.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">{delivery.customerName}</h3>
            <div className="space-y-2">
              <a
                href={`tel:${delivery.phone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {delivery.phone}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {delivery.address}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Items
            </h4>
            <div className="space-y-2">
              {delivery.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Distance
              </span>
              <span className="text-foreground">{delivery.distance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> ETA
              </span>
              <span className="text-foreground">{delivery.estimatedTime}</span>
            </div>
            {delivery.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">Notes: </span>
                <span className="text-foreground">{delivery.notes}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">£{delivery.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(delivery.address)}`)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
            
            {nextAction && (
              <Button
                className="w-full gradient-primary"
                onClick={() => {
                  onUpdateStatus(delivery.id, nextAction.next);
                  if (nextAction.next === "delivered") {
                    onClose();
                  }
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {nextAction.label}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryModal;
