import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

const mockDeliveries: DeliveryOrder[] = [
  {
    id: "#D001",
    customerName: "James Wilson",
    phone: "+44 7700 900123",
    address: "42 High Street, London, W1A 1AA",
    items: ["2x Margherita", "1x Garlic Bread", "2x Cola"],
    total: 28.50,
    status: "pending",
    estimatedTime: "10-15 min",
    distance: "1.2 km",
  },
  {
    id: "#D002",
    customerName: "Sophie Brown",
    phone: "+44 7700 900456",
    address: "15 Queen's Road, London, SW1A 2BB",
    items: ["1x Pepperoni", "1x Hawaiian", "1x Tiramisu"],
    total: 34.00,
    status: "picked_up",
    estimatedTime: "20-25 min",
    distance: "2.8 km",
  },
  {
    id: "#D003",
    customerName: "Oliver Davis",
    phone: "+44 7700 900789",
    address: "8 Park Lane, London, W1K 1CC",
    items: ["3x Carbonara", "2x Caesar Salad"],
    total: 50.00,
    status: "on_the_way",
    estimatedTime: "5 min",
    distance: "0.8 km",
  },
];

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(mockDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const updateStatus = (id: string, status: DeliveryOrder["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    if (selectedDelivery?.id === id) {
      setSelectedDelivery({ ...selectedDelivery, status });
    }
  };

  const getStatusColor = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-status-warning text-black";
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

  const activeDeliveries = deliveries.filter((d) => d.status !== "delivered");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-category-peach" />
            <h1 className="text-xl font-bold text-foreground">Delivery Rider</h1>
          </div>
          <Badge variant="secondary">{activeDeliveries.length} Active</Badge>
        </div>

        {/* Delivery List */}
        <div className="space-y-4">
          {activeDeliveries.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Active Deliveries</h3>
              <p className="text-muted-foreground">New delivery orders will appear here</p>
            </div>
          ) : (
            activeDeliveries.map((delivery) => (
              <button
                key={delivery.id}
                onClick={() => setSelectedDelivery(delivery)}
                className={`w-full bg-card border border-border rounded-2xl p-5 text-left transition-all duration-200 hover:border-primary/50 ${
                  selectedDelivery?.id === delivery.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{delivery.id}</span>
                      <Badge className={getStatusColor(delivery.status)}>
                        {getStatusLabel(delivery.status)}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-foreground">{delivery.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">£{delivery.total.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {delivery.distance}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{delivery.address}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ETA: {delivery.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    {delivery.items.length} items
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Selected Delivery */}
      {selectedDelivery && (
        <div className="w-96 bg-card border-l border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Order {selectedDelivery.id}
            </h2>
            <Badge className={getStatusColor(selectedDelivery.status)}>
              {getStatusLabel(selectedDelivery.status)}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3">{selectedDelivery.customerName}</h3>
            <div className="space-y-2">
              <a
                href={`tel:${selectedDelivery.phone}`}
                className="flex items-center gap-2 text-sm text-category-sky hover:underline"
              >
                <Phone className="w-4 h-4" />
                {selectedDelivery.phone}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {selectedDelivery.address}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h4>
            <div className="space-y-2">
              {selectedDelivery.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="text-foreground">{selectedDelivery.distance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ETA</span>
              <span className="text-foreground">{selectedDelivery.estimatedTime}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">£{selectedDelivery.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedDelivery.address)}`)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
            
            {getNextAction(selectedDelivery.status) && (
              <Button
                className="w-full gradient-primary"
                onClick={() =>
                  updateStatus(
                    selectedDelivery.id,
                    getNextAction(selectedDelivery.status)!.next
                  )
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {getNextAction(selectedDelivery.status)!.label}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPage;
