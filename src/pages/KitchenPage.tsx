import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, ChefHat, GripVertical, RotateCcw, MessageSquare, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import CustomerInstructionsModal from "@/components/CustomerInstructionsModal";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  completed: boolean;
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  startTime: Date;
  estimatedMinutes: number;
  status: "new" | "preparing" | "ready" | "completed" | "delayed";
  priority: boolean;
  preparingStaffId?: string;
  preparingStaffName?: string;
  customerInstructions?: string;
}

const mockOrders: Order[] = [
  { id: "#26678", tableNumber: "1", items: [{ id: "1", name: "Jollof Rice (L)", quantity: 2, completed: false }, { id: "2", name: "Grilled Chicken", quantity: 1, completed: false }, { id: "3", name: "Plantain", quantity: 2, completed: false }], startTime: new Date(Date.now() - 5 * 60000), estimatedMinutes: 10, status: "new", priority: true, customerInstructions: "Extra spicy please. No onions on the chicken." },
  { id: "#26679", tableNumber: "3", items: [{ id: "4", name: "Fried Rice (M)", quantity: 3, completed: false }, { id: "5", name: "Coleslaw", quantity: 2, completed: true }], startTime: new Date(Date.now() - 8 * 60000), estimatedMinutes: 12, status: "preparing", priority: false, preparingStaffId: "3", preparingStaffName: "Mike R." },
  { id: "#26680", tableNumber: "8", items: [{ id: "6", name: "White Rice", quantity: 1, completed: false }, { id: "7", name: "Beef Suya", quantity: 2, notes: "Well done", completed: false }], startTime: new Date(Date.now() - 15 * 60000), estimatedMinutes: 10, status: "preparing", priority: false, preparingStaffId: "1", preparingStaffName: "John D.", customerInstructions: "Customer is allergic to groundnuts" },
  { id: "#26681", tableNumber: "5", items: [{ id: "8", name: "Jollof Rice (M)", quantity: 2, completed: false }, { id: "9", name: "Fried Fish", quantity: 2, completed: false }], startTime: new Date(Date.now() - 2 * 60000), estimatedMinutes: 15, status: "new", priority: false },
];

const KitchenPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [currentStaffId, setCurrentStaffId] = useState<string>("1");
  const [currentStaffName, setCurrentStaffName] = useState<string>("John D.");
  const [draggedItem, setDraggedItem] = useState<{ orderId: string; itemId: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [instructionsModal, setInstructionsModal] = useState<{ open: boolean; orderId: string; instructions: string }>({ open: false, orderId: "", instructions: "" });
  const [, setTick] = useState(0);

  useEffect(() => {
    const staffData = sessionStorage.getItem("currentStaff");
    if (staffData) {
      const staff = JSON.parse(staffData);
      setCurrentStaffId(staff.id);
      setCurrentStaffName(staff.name);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingSeconds = (order: Order) => {
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

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setConfirmDialog({
      open: true,
      title: status === "completed" ? "Complete Order" : "Update Order",
      description: `Are you sure you want to mark this order as ${status}?`,
      action: () => {
        if (status === "preparing") {
          setOrders((prev) => prev.map((order) => order.id === id ? { ...order, status, preparingStaffId: currentStaffId, preparingStaffName: currentStaffName } : order));
        } else if (status === "completed") {
          const order = orders.find((o) => o.id === id);
          if (order) {
            setCompletedOrders((prev) => [{ ...order, status: "completed" }, ...prev]);
            setOrders((prev) => prev.filter((o) => o.id !== id));
          }
        } else {
          setOrders((prev) => prev.map((order) => order.id === id ? { ...order, status } : order));
        }
      }
    });
  };

  const recallOrder = (orderId: string) => {
    setConfirmDialog({
      open: true, title: "Recall Order", description: "This will move the order back to New. Continue?",
      action: () => {
        const order = completedOrders.find((o) => o.id === orderId);
        if (order) {
          setOrders((prev) => [...prev, { ...order, status: "new", startTime: new Date() }]);
          setCompletedOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
      }
    });
  };

  const toggleItemComplete = (orderId: string, itemId: string) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, items: order.items.map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item) } : order));
  };

  const reorderItems = (orderId: string, fromIndex: number, toIndex: number) => {
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId) return order;
      const newItems = [...order.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return { ...order, items: newItems };
    }));
  };

  const getStaffDisplay = (order: Order) => {
    if (!order.preparingStaffId) return null;
    return order.preparingStaffId === currentStaffId ? "Myself" : order.preparingStaffName;
  };

  const getStatusBorderColor = (status: Order["status"], remaining: number) => {
    if (remaining < 0 && status === "preparing") return "border-l-destructive";
    switch (status) {
      case "new": return "border-l-status-warning";
      case "preparing": return "border-l-status-process";
      case "ready":
      case "completed": return "border-l-status-success";
      case "delayed": return "border-l-destructive";
    }
  };

  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const delayedOrders = preparingOrders.filter((o) => getRemainingSeconds(o) < 0);
  const onTimeOrders = preparingOrders.filter((o) => getRemainingSeconds(o) >= 0);
  const readyOrders = orders.filter((o) => o.status === "ready");

  const OrderCard = ({ order, showActions = true }: { order: Order; showActions?: boolean }) => {
    const remaining = getRemainingSeconds(order);
    const isDelayed = remaining < 0 && order.status === "preparing";

    return (
      <div className={`bg-card border border-border rounded-2xl p-4 border-l-4 ${getStatusBorderColor(order.status, remaining)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-lg font-semibold">Table {order.tableNumber}</Badge>
            <span className="text-sm text-muted-foreground">{order.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {order.priority && <AlertCircle className="w-5 h-5 text-status-warning" />}
            {order.customerInstructions && (
              <button onClick={() => setInstructionsModal({ open: true, orderId: order.id, instructions: order.customerInstructions! })} className="text-status-warning hover:text-status-warning/80">
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
            {order.status === "preparing" && getStaffDisplay(order) && (
              <Badge variant="outline" className="text-xs rounded-lg">
                <ChefHat className="w-3 h-3 mr-1" />
                {getStaffDisplay(order)}
              </Badge>
            )}
          </div>
        </div>

        {(order.status === "preparing" || order.status === "new") && (
          <div className={`flex items-center gap-2 mb-3 p-3 rounded-xl ${isDelayed ? "bg-destructive/10" : "bg-muted"}`}>
            {isDelayed ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
            <span className={`font-mono font-bold ${isDelayed ? "text-destructive" : "text-foreground"}`}>{formatCountdown(remaining)}</span>
            {isDelayed && <Badge className="bg-destructive text-destructive-foreground text-xs rounded-lg">DELAYED</Badge>}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div 
              key={item.id} 
              draggable={order.status === "preparing"} 
              onDragStart={() => setDraggedItem({ orderId: order.id, itemId: item.id })} 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={() => { 
                if (draggedItem && draggedItem.orderId === order.id) { 
                  const fromIndex = order.items.findIndex((i) => i.id === draggedItem.itemId); 
                  reorderItems(order.id, fromIndex, idx); 
                } 
                setDraggedItem(null); 
              }} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${order.status === "preparing" ? "hover:bg-muted cursor-grab" : "bg-muted/50"} ${item.completed ? "opacity-50" : ""}`}
            >
              {order.status === "preparing" && (
                <>
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <button 
                    onClick={() => toggleItemComplete(order.id, item.id)} 
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? "bg-status-success border-status-success" : "border-border hover:border-primary"}`}
                  >
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                </>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-foreground font-medium ${item.completed ? "line-through" : ""}`}>{item.name}</span>
                  <span className="text-muted-foreground flex-shrink-0">×{item.quantity}</span>
                </div>
                {item.notes && <p className="text-xs text-status-warning mt-1">Note: {item.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        {showActions && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Est: {order.estimatedMinutes} min</div>
            {order.status === "new" && (
              <Button size="sm" className="rounded-xl" onClick={() => updateOrderStatus(order.id, "preparing")}>
                Start Preparing
              </Button>
            )}
            {order.status === "preparing" && (
              <Button size="sm" className="rounded-xl bg-status-success hover:bg-status-success/90" onClick={() => updateOrderStatus(order.id, "ready")}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Ready
              </Button>
            )}
            {order.status === "ready" && (
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => updateOrderStatus(order.id, "completed")}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        )}
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
              <div className="w-10 h-10 rounded-xl bg-category-lavender flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-category-lavender" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Kitchen Display</h1>
                <p className="text-xs text-muted-foreground">{orders.length} Active Orders</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* New Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-status-warning" />
              <h2 className="font-semibold text-foreground">New</h2>
              <Badge variant="outline" className="rounded-lg">{newOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {newOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-status-process" />
              <h2 className="font-semibold text-foreground">Preparing</h2>
              <Badge variant="outline" className="rounded-lg">{onTimeOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {onTimeOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>

          {/* Delayed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <h2 className="font-semibold text-foreground">Delayed</h2>
              <Badge variant="outline" className="rounded-lg text-destructive border-destructive">{delayedOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {delayedOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No delayed orders</p>
                </div>
              ) : delayedOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>

          {/* Ready & Completed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-status-success" />
              <h2 className="font-semibold text-foreground">Ready</h2>
              <Badge variant="outline" className="rounded-lg">{readyOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {readyOrders.map((order) => <OrderCard key={order.id} order={order} />)}
              {completedOrders.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Recently Completed</h3>
                  <div className="space-y-3">
                    {completedOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-4 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-lg">Table {order.tableNumber}</Badge>
                            <span className="text-sm text-muted-foreground">{order.id}</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => recallOrder(order.id)} className="rounded-lg">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Recall
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
      <CustomerInstructionsModal open={instructionsModal.open} onClose={() => setInstructionsModal({ ...instructionsModal, open: false })} orderId={instructionsModal.orderId} instructions={instructionsModal.instructions} />
    </div>
  );
};

export default KitchenPage;
