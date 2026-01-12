import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, MapPin, Clock, Package, Timer, CheckCircle2, AlertTriangle, ArrowLeft, Phone, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeliveryModal from "@/components/DeliveryModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";

interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  status: "pending" | "picked_up" | "on_the_way" | "delivered";
  startTime: Date;
  estimatedMinutes: number;
  distance: string;
  riderName?: string;
  pickupTime?: string;
  notes?: string;
}

const mockDeliveries: DeliveryOrder[] = [
  { id: "#D001", customerName: "James Adeyemi", phone: "+234 801 234 5678", address: "42 High Level, Makurdi", items: ["2x Jollof Rice", "1x Plantain", "2x Chapman"], total: 5600, status: "pending", startTime: new Date(Date.now() - 2 * 60000), estimatedMinutes: 15, distance: "1.2 km", notes: "Ring doorbell twice" },
  { id: "#D002", customerName: "Sophie Okafor", phone: "+234 802 345 6789", address: "15 Wurukum Road, Makurdi", items: ["1x Fried Rice", "1x Grilled Chicken", "1x Zobo"], total: 5800, status: "picked_up", startTime: new Date(Date.now() - 8 * 60000), estimatedMinutes: 20, distance: "2.8 km" },
  { id: "#D003", customerName: "Oliver Bello", phone: "+234 803 456 7890", address: "8 North Bank, Makurdi", items: ["3x Beef Suya", "2x Coleslaw"], total: 6600, status: "on_the_way", startTime: new Date(Date.now() - 15 * 60000), estimatedMinutes: 12, distance: "0.8 km" },
];

const completedToday: DeliveryOrder[] = [
  { id: "#D098", customerName: "Ada Eze", phone: "", address: "10 Modern Market", items: ["1x Jollof"], total: 2500, status: "delivered", startTime: new Date(Date.now() - 60 * 60000), estimatedMinutes: 15, distance: "1.5 km" },
  { id: "#D097", customerName: "Chidi Obi", phone: "", address: "22 Old GRA", items: ["2x Fried Rice"], total: 4600, status: "delivered", startTime: new Date(Date.now() - 90 * 60000), estimatedMinutes: 20, distance: "2.1 km" },
];

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(mockDeliveries);
  const [completed] = useState<DeliveryOrder[]>(completedToday);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingSeconds = (order: DeliveryOrder) => {
    const elapsed = Math.floor((Date.now() - order.startTime.getTime()) / 1000);
    return order.estimatedMinutes * 60 - elapsed;
  };

  const formatCountdown = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const updateStatus = (id: string, status: DeliveryOrder["status"]) => {
    setConfirmDialog({
      open: true,
      title: `Update to ${status.replace("_", " ")}`,
      description: "Are you sure you want to update this delivery status?",
      action: () => {
        setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
        if (selectedDelivery?.id === id) setSelectedDelivery((prev) => (prev ? { ...prev, status } : null));
      }
    });
  };

  const getStatusColor = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending": return "bg-status-warning text-foreground";
      case "picked_up": return "bg-status-info text-white";
      case "on_the_way": return "bg-status-process text-white";
      case "delivered": return "bg-status-success text-white";
    }
  };

  const getStatusLabel = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "pending": return "Awaiting Pickup";
      case "picked_up": return "Picked Up";
      case "on_the_way": return "On The Way";
      case "delivered": return "Delivered";
    }
  };

  const newOrders = deliveries.filter((d) => d.status === "pending");
  const deliveringOrders = deliveries.filter((d) => ["picked_up", "on_the_way"].includes(d.status));

  const totalDeliveries = completed.length + deliveringOrders.length;
  const avgDeliveryTime = 18;
  const onTimeRate = 92;

  const DeliveryCard = ({ delivery }: { delivery: DeliveryOrder }) => {
    const remaining = getRemainingSeconds(delivery);
    const isDelayed = remaining < 0;

    return (
      <div 
        onClick={() => setSelectedDelivery(delivery)} 
        className="bg-card border border-border rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{delivery.id}</span>
              <Badge className={`${getStatusColor(delivery.status)} rounded-lg`}>{getStatusLabel(delivery.status)}</Badge>
            </div>
            <p className="text-base font-medium text-foreground">{delivery.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">₦{delivery.total.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              {delivery.distance}
            </div>
          </div>
        </div>

        {delivery.status !== "delivered" && (
          <div className={`flex items-center gap-2 mb-3 p-3 rounded-xl ${isDelayed ? "bg-destructive/10" : "bg-muted"}`}>
            {isDelayed ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <Timer className="w-4 h-4 text-muted-foreground" />}
            <span className={`font-mono font-bold ${isDelayed ? "text-destructive" : "text-foreground"}`}>{formatCountdown(remaining)}</span>
            {isDelayed && <Badge className="bg-destructive text-destructive-foreground text-xs rounded-lg">DELAYED</Badge>}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{delivery.address}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="w-4 h-4" />
            {delivery.items.length} items
          </div>
          {delivery.notes && (
            <span className="text-status-warning text-xs">Has notes</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-category-peach flex items-center justify-center">
                <Bike className="w-5 h-5 text-category-peach" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Delivery Rider</h1>
                <p className="text-xs text-muted-foreground">{deliveries.filter((d) => d.status !== "delivered").length} Active Deliveries</p>
              </div>
            </div>
          </div>
          <ActivityLogButton onClick={() => setShowActivityLog(true)} />
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{totalDeliveries}</p>
            <p className="text-sm text-muted-foreground mt-1">Today's Deliveries</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{avgDeliveryTime}m</p>
            <p className="text-sm text-muted-foreground mt-1">Avg. Time</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-status-success">{onTimeRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">On-Time Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted h-11 w-full mb-4">
            <TabsTrigger value="new" className="flex-1 gap-2 rounded-lg">
              New
              <Badge variant="secondary" className="h-5 px-1.5">{newOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="delivering" className="flex-1 gap-2 rounded-lg">
              Delivering
              <Badge variant="secondary" className="h-5 px-1.5">{deliveringOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 gap-2 rounded-lg">
              Completed
              <Badge variant="secondary" className="h-5 px-1.5">{completed.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newOrders.length === 0 ? (
                <div className="col-span-full bg-card border border-border rounded-2xl p-16 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No New Deliveries</h3>
                  <p className="text-muted-foreground">New delivery orders will appear here</p>
                </div>
              ) : newOrders.map((delivery) => <DeliveryCard key={delivery.id} delivery={delivery} />)}
            </div>
          </TabsContent>

          <TabsContent value="delivering">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveringOrders.length === 0 ? (
                <div className="col-span-full bg-card border border-border rounded-2xl p-16 text-center">
                  <Bike className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Active Deliveries</h3>
                  <p className="text-muted-foreground">Pick up orders to start delivering</p>
                </div>
              ) : deliveringOrders.map((delivery) => <DeliveryCard key={delivery.id} delivery={delivery} />)}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((delivery) => (
                <div key={delivery.id} className="bg-card border border-border rounded-2xl p-5 opacity-70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{delivery.id}</span>
                    <Badge className="bg-status-success text-white rounded-lg">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Delivered
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground font-medium">{delivery.customerName}</p>
                  <p className="text-xs text-muted-foreground">{delivery.address}</p>
                  <p className="text-sm font-bold text-foreground mt-2">₦{delivery.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <DeliveryModal delivery={selectedDelivery} onClose={() => setSelectedDelivery(null)} onUpdateStatus={updateStatus} />
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Delivery Rider" />
    </div>
  );
};

export default DeliveryPage;
