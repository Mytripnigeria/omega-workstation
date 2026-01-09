import { useState } from "react";
import { Users, Clock, CheckCircle2, AlertTriangle, ChefHat, Utensils, Bike, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import CountdownTimer from "@/components/CountdownTimer";

interface WaiterOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
  items: { name: string; quantity: number; notes?: string }[];
  total: number;
  status: "new" | "ready" | "delayed";
  preparedAt?: Date;
  startTime: Date;
  estimatedMinutes: number;
}

const mockOrders: WaiterOrder[] = [
  { 
    id: "1", orderNumber: "#ORD001", customerName: "John Ade", orderType: "dine-in", tableNumber: "5",
    items: [{ name: "Jollof Rice (L)", quantity: 2 }, { name: "Grilled Chicken", quantity: 2, notes: "Extra spicy" }],
    total: 9000, status: "ready", preparedAt: new Date(Date.now() - 2 * 60000), startTime: new Date(Date.now() - 15 * 60000), estimatedMinutes: 15
  },
  { 
    id: "2", orderNumber: "#ORD002", customerName: "Sarah Obi", orderType: "takeaway",
    items: [{ name: "Fried Rice (M)", quantity: 1 }, { name: "Beef Suya", quantity: 2 }],
    total: 5900, status: "ready", preparedAt: new Date(Date.now() - 5 * 60000), startTime: new Date(Date.now() - 18 * 60000), estimatedMinutes: 12
  },
  { 
    id: "3", orderNumber: "#ORD003", customerName: "Mike Johnson", orderType: "delivery",
    items: [{ name: "White Rice", quantity: 3 }, { name: "Fish Fillet", quantity: 3 }],
    total: 9600, status: "ready", preparedAt: new Date(Date.now() - 1 * 60000), startTime: new Date(Date.now() - 20 * 60000), estimatedMinutes: 20
  },
  { 
    id: "4", orderNumber: "#ORD004", customerName: "Ada Eze", orderType: "dine-in", tableNumber: "3",
    items: [{ name: "Chapman (L)", quantity: 4 }, { name: "Plantain", quantity: 2 }],
    total: 6400, status: "delayed", startTime: new Date(Date.now() - 25 * 60000), estimatedMinutes: 10
  },
  { 
    id: "5", orderNumber: "#ORD005", customerName: "Chidi Okafor", orderType: "dine-in", tableNumber: "8",
    items: [{ name: "Jollof Rice (M)", quantity: 1 }, { name: "Moi Moi", quantity: 2 }],
    total: 3200, status: "new", startTime: new Date(Date.now() - 3 * 60000), estimatedMinutes: 15
  },
  { 
    id: "6", orderNumber: "#ORD006", customerName: "Grace Nwosu", orderType: "takeaway",
    items: [{ name: "Zobo", quantity: 5 }, { name: "Coleslaw", quantity: 3 }],
    total: 3700, status: "new", startTime: new Date(Date.now() - 5 * 60000), estimatedMinutes: 8
  },
];

const WaiterPage = () => {
  const [orders, setOrders] = useState<WaiterOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);
  const [activeTab, setActiveTab] = useState("ready");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {}
  });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({
    open: false, type: "success", title: ""
  });

  const readyOrders = orders.filter((o) => o.status === "ready");
  const delayedOrders = orders.filter((o) => o.status === "delayed");
  const newOrders = orders.filter((o) => o.status === "new");

  const getOrderTypeIcon = (type: WaiterOrder["orderType"]) => {
    switch (type) {
      case "dine-in": return <Utensils className="w-4 h-4" />;
      case "takeaway": return <ShoppingBag className="w-4 h-4" />;
      case "delivery": return <Bike className="w-4 h-4" />;
    }
  };

  const getOrderTypeLabel = (type: WaiterOrder["orderType"]) => {
    switch (type) {
      case "dine-in": return "Dine In";
      case "takeaway": return "Takeaway";
      case "delivery": return "Delivery";
    }
  };

  const getStatusColor = (status: WaiterOrder["status"]) => {
    switch (status) {
      case "ready": return "bg-status-success text-white";
      case "delayed": return "bg-status-warning text-foreground";
      case "new": return "bg-status-info text-white";
    }
  };

  const handleServeOrder = (order: WaiterOrder) => {
    setConfirmDialog({
      open: true,
      title: "Serve Order",
      description: `Mark order ${order.orderNumber} as served to ${order.customerName}?`,
      action: () => {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setSelectedOrder(null);
        setToast({ open: true, type: "success", title: "Order Served!", message: `${order.orderNumber} has been served` });
      }
    });
  };

  const handleHandToRider = (order: WaiterOrder) => {
    setConfirmDialog({
      open: true,
      title: "Hand to Rider",
      description: `Hand order ${order.orderNumber} to delivery rider?`,
      action: () => {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setSelectedOrder(null);
        setToast({ open: true, type: "success", title: "Handed to Rider!", message: `${order.orderNumber} is now with delivery` });
      }
    });
  };

  const formatTimeSince = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    return `${mins} min ago`;
  };

  const renderOrderCard = (order: WaiterOrder) => (
    <button
      key={order.id}
      onClick={() => setSelectedOrder(order)}
      className={`w-full bg-card border-2 rounded-xl p-4 text-left transition-all hover:shadow-md ${
        selectedOrder?.id === order.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{order.orderNumber}</span>
          <Badge variant="outline" className="flex items-center gap-1">
            {getOrderTypeIcon(order.orderType)}
            {getOrderTypeLabel(order.orderType)}
          </Badge>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {order.status === "ready" ? "Ready" : order.status === "delayed" ? "Delayed" : "In Kitchen"}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-foreground font-medium">{order.customerName}</span>
        {order.tableNumber && (
          <Badge variant="secondary">Table {order.tableNumber}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{order.items.length} items • ₦{order.total.toLocaleString()}</span>
        {order.status === "ready" && order.preparedAt && (
          <span className="text-status-success text-xs">Ready {formatTimeSince(order.preparedAt)}</span>
        )}
        {order.status === "delayed" && (
          <span className="text-status-warning text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        )}
        {order.status === "new" && (
          <CountdownTimer targetMinutes={order.estimatedMinutes} startTime={order.startTime} />
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <PageHeader title="Waiter Display" icon={Users} iconColor="text-category-pink" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="ready" className="flex-1 sm:flex-none gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Ready
              <Badge variant="secondary" className="ml-1">{readyOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="delayed" className="flex-1 sm:flex-none gap-2">
              <AlertTriangle className="w-4 h-4" />
              Delayed
              <Badge variant="secondary" className="ml-1">{delayedOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1 sm:flex-none gap-2">
              <ChefHat className="w-4 h-4" />
              In Kitchen
              <Badge variant="secondary" className="ml-1">{newOrders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="mt-4">
            {readyOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders ready for service</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {readyOrders.map(renderOrderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="delayed" className="mt-4">
            {delayedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No delayed orders</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {delayedOrders.map(renderOrderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            {newOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders in kitchen</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {newOrders.map(renderOrderCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Order Details */}
      {selectedOrder && (
        <div className="w-full lg:w-80 xl:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Order Details</h2>
            <Badge className={getStatusColor(selectedOrder.status)}>
              {selectedOrder.status === "ready" ? "Ready" : selectedOrder.status === "delayed" ? "Delayed" : "In Kitchen"}
            </Badge>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order</span>
              <span className="font-bold text-foreground">{selectedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-foreground">{selectedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getOrderTypeIcon(selectedOrder.orderType)}
                {getOrderTypeLabel(selectedOrder.orderType)}
              </Badge>
            </div>
            {selectedOrder.tableNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Table</span>
                <span className="text-foreground font-medium">Table {selectedOrder.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-primary font-bold">₦{selectedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Items</h3>
            <div className="space-y-2">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{item.quantity}x {item.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-status-warning mt-1">Note: {item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {selectedOrder.status === "ready" && (
              <>
                {selectedOrder.orderType === "delivery" ? (
                  <Button className="w-full gradient-primary" onClick={() => handleHandToRider(selectedOrder)}>
                    <Bike className="w-4 h-4 mr-2" />
                    Hand to Rider
                  </Button>
                ) : (
                  <Button className="w-full gradient-primary" onClick={() => handleServeOrder(selectedOrder)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Served
                  </Button>
                )}
              </>
            )}
            {selectedOrder.status === "delayed" && (
              <Button variant="outline" className="w-full border-status-warning text-status-warning">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Check with Kitchen
              </Button>
            )}
            {selectedOrder.status === "new" && (
              <div className="text-center py-4 text-muted-foreground">
                <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Order is being prepared</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }}
      />
      <ToastNotification
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
};

export default WaiterPage;
