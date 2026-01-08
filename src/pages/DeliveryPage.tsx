import { useState } from "react";
import { Bike, MapPin, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import DeliveryModal from "@/components/DeliveryModal";

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

const mockDeliveries: DeliveryOrder[] = [
  {
    id: "#D001",
    customerName: "James Wilson",
    phone: "+44 7700 900123",
    address: "42 High Street, London, W1A 1AA",
    items: ["2x Margherita", "1x Garlic Bread", "2x Cola"],
    total: 28.5,
    status: "pending",
    estimatedTime: "10-15 min",
    distance: "1.2 km",
    notes: "Ring doorbell twice",
  },
  {
    id: "#D002",
    customerName: "Sophie Brown",
    phone: "+44 7700 900456",
    address: "15 Queen's Road, London, SW1A 2BB",
    items: ["1x Pepperoni", "1x Hawaiian", "1x Tiramisu"],
    total: 34.0,
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
    total: 50.0,
    status: "on_the_way",
    estimatedTime: "5 min",
    distance: "0.8 km",
  },
];

const DeliveryPage = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(mockDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const updateStatus = (id: string, status: DeliveryOrder["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    if (selectedDelivery?.id === id) {
      setSelectedDelivery((prev) => (prev ? { ...prev, status } : null));
    }
  };

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

  const activeDeliveries = deliveries.filter((d) => d.status !== "delivered");

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Delivery Rider"
        icon={Bike}
        iconColor="text-category-peach"
        badge={`${activeDeliveries.length} Active`}
      />

      {/* Delivery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeDeliveries.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Active Deliveries</h3>
            <p className="text-muted-foreground">New delivery orders will appear here</p>
          </div>
        ) : (
          activeDeliveries.map((delivery) => (
            <button
              key={delivery.id}
              onClick={() => setSelectedDelivery(delivery)}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{delivery.id}</span>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusLabel(delivery.status)}
                    </Badge>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-foreground">{delivery.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-primary">£{delivery.total.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {delivery.distance}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{delivery.address}</span>
              </div>

              <div className="flex items-center gap-4 text-xs sm:text-sm">
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

      {/* Delivery Details Modal */}
      <DeliveryModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
};

export default DeliveryPage;
