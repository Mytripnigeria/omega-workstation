import { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, ChefHat, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";

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
  time: string;
  status: "new" | "preparing" | "ready" | "completed";
  priority: boolean;
  preparingStaffId?: string;
  preparingStaffName?: string;
}

const mockOrders: Order[] = [
  {
    id: "#26678",
    tableNumber: "1",
    items: [
      { id: "1", name: "Margherita", quantity: 2, completed: false },
      { id: "2", name: "Pepperoni", quantity: 1, completed: false },
      { id: "3", name: "Garlic Bread", quantity: 2, completed: false },
    ],
    time: "5 min ago",
    status: "new",
    priority: true,
  },
  {
    id: "#26679",
    tableNumber: "3",
    items: [
      { id: "4", name: "Carbonara", quantity: 3, completed: false },
      { id: "5", name: "Caesar Salad", quantity: 2, completed: true },
    ],
    time: "8 min ago",
    status: "preparing",
    priority: false,
    preparingStaffId: "3",
    preparingStaffName: "Mike R.",
  },
  {
    id: "#26680",
    tableNumber: "8",
    items: [
      { id: "6", name: "Veggie Supreme", quantity: 1, completed: false },
      { id: "7", name: "Lasagna", quantity: 2, notes: "Extra cheese", completed: false },
    ],
    time: "12 min ago",
    status: "preparing",
    priority: false,
    preparingStaffId: "1",
    preparingStaffName: "John D.",
  },
  {
    id: "#26681",
    tableNumber: "5",
    items: [
      { id: "8", name: "Hawaiian", quantity: 2, completed: false },
      { id: "9", name: "Tiramisu", quantity: 2, completed: false },
    ],
    time: "2 min ago",
    status: "new",
    priority: false,
  },
];

const KitchenPage = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [currentStaffId, setCurrentStaffId] = useState<string>("1");
  const [currentStaffName, setCurrentStaffName] = useState<string>("John D.");
  const [draggedItem, setDraggedItem] = useState<{ orderId: string; itemId: string } | null>(null);

  useEffect(() => {
    const staffData = sessionStorage.getItem("currentStaff");
    if (staffData) {
      const staff = JSON.parse(staffData);
      setCurrentStaffId(staff.id);
      setCurrentStaffName(staff.name);
    }
  }, []);

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    if (status === "preparing") {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, status, preparingStaffId: currentStaffId, preparingStaffName: currentStaffName }
            : order
        )
      );
    } else if (status === "completed") {
      const order = orders.find((o) => o.id === id);
      if (order) {
        setCompletedOrders((prev) => [{ ...order, status: "completed" }, ...prev]);
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } else {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );
    }
  };

  const toggleItemComplete = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : order
      )
    );
  };

  const recallOrder = (orderId: string) => {
    const order = completedOrders.find((o) => o.id === orderId);
    if (order) {
      setOrders((prev) => [...prev, { ...order, status: "ready" }]);
      setCompletedOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const reorderItems = (orderId: string, fromIndex: number, toIndex: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const newItems = [...order.items];
        const [movedItem] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, movedItem);
        return { ...order, items: newItems };
      })
    );
  };

  const getStaffDisplay = (order: Order) => {
    if (!order.preparingStaffId) return null;
    return order.preparingStaffId === currentStaffId ? "Myself" : order.preparingStaffName;
  };

  const getStatusBorderColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "border-l-status-warning";
      case "preparing":
        return "border-l-status-process";
      case "ready":
      case "completed":
        return "border-l-status-success";
    }
  };

  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  const OrderCard = ({ order, showActions = true }: { order: Order; showActions?: boolean }) => (
    <div
      className={`bg-card border border-border rounded-xl p-3 sm:p-4 border-l-4 ${getStatusBorderColor(order.status)}`}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Table {order.tableNumber}</Badge>
          <span className="text-sm text-muted-foreground">{order.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {order.priority && <AlertCircle className="w-5 h-5 text-status-warning" />}
          {order.status === "preparing" && getStaffDisplay(order) && (
            <Badge variant="outline" className="text-xs">
              <ChefHat className="w-3 h-3 mr-1" />
              {getStaffDisplay(order)}
            </Badge>
          )}
        </div>
      </div>

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
            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
              order.status === "preparing" ? "hover:bg-secondary/50 cursor-grab" : ""
            } ${item.completed ? "opacity-50" : ""}`}
          >
            {order.status === "preparing" && (
              <>
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <button
                  onClick={() => toggleItemComplete(order.id, item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? "bg-status-success border-status-success"
                      : "border-muted-foreground hover:border-primary"
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              </>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-foreground truncate ${item.completed ? "line-through" : ""}`}>
                  {item.name}
                </span>
                <span className="text-muted-foreground flex-shrink-0">×{item.quantity}</span>
              </div>
              {item.notes && (
                <p className="text-xs text-status-warning mt-1">Note: {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showActions && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            {order.time}
          </div>
          {order.status === "new" && (
            <Button
              size="sm"
              className="gradient-primary"
              onClick={() => updateOrderStatus(order.id, "preparing")}
            >
              Start Preparing
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-status-success hover:bg-status-success/80 text-white"
              onClick={() => updateOrderStatus(order.id, "ready")}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateOrderStatus(order.id, "completed")}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Kitchen Display"
        icon={ChefHat}
        iconColor="text-category-lavender"
        badge={`${orders.length} Orders`}
      />

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* New Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <h2 className="font-semibold text-foreground">New Orders</h2>
            <Badge variant="outline">{newOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {newOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Preparing */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-process" />
            <h2 className="font-semibold text-foreground">Preparing</h2>
            <Badge variant="outline">{preparingOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Ready & Completed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-success" />
            <h2 className="font-semibold text-foreground">Ready to Serve</h2>
            <Badge variant="outline">{readyOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {readyOrders.length === 0 && completedOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders ready yet</p>
              </div>
            ) : (
              <>
                {readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                
                {/* Completed Orders (Recallable) */}
                {completedOrders.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Recently Completed
                    </h3>
                    <div className="space-y-3">
                      {completedOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="bg-card/50 border border-border rounded-xl p-3 opacity-60"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Table {order.tableNumber}</Badge>
                              <span className="text-sm text-muted-foreground">{order.id}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => recallOrder(order.id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Recall
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenPage;
