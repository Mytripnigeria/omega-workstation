import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  time: string;
  status: "new" | "preparing" | "ready";
  priority: boolean;
}

const mockOrders: Order[] = [
  {
    id: "#26678",
    tableNumber: "1",
    items: [
      { name: "Margherita", quantity: 2 },
      { name: "Pepperoni", quantity: 1 },
      { name: "Garlic Bread", quantity: 2 },
    ],
    time: "5 min ago",
    status: "new",
    priority: true,
  },
  {
    id: "#26679",
    tableNumber: "3",
    items: [
      { name: "Carbonara", quantity: 3 },
      { name: "Caesar Salad", quantity: 2 },
    ],
    time: "8 min ago",
    status: "preparing",
    priority: false,
  },
  {
    id: "#26680",
    tableNumber: "8",
    items: [
      { name: "Veggie Supreme", quantity: 1 },
      { name: "Lasagna", quantity: 2, notes: "Extra cheese" },
    ],
    time: "12 min ago",
    status: "preparing",
    priority: false,
  },
  {
    id: "#26681",
    tableNumber: "5",
    items: [
      { name: "Hawaiian", quantity: 2 },
      { name: "Tiramisu", quantity: 2 },
    ],
    time: "2 min ago",
    status: "new",
    priority: false,
  },
];

const KitchenPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "bg-status-warning text-black";
      case "preparing":
        return "bg-status-process text-white";
      case "ready":
        return "bg-status-success text-white";
    }
  };

  const getStatusBorderColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "border-l-status-warning";
      case "preparing":
        return "border-l-status-process";
      case "ready":
        return "border-l-status-success";
    }
  };

  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-category-lavender" />
          <h1 className="text-xl font-bold text-foreground">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{orders.length} Orders</Badge>
        </div>
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <h2 className="font-semibold text-foreground">New Orders</h2>
            <Badge variant="outline">{newOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {newOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-card border border-border rounded-xl p-4 border-l-4 ${getStatusBorderColor(order.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Table {order.tableNumber}</Badge>
                    <span className="text-sm text-muted-foreground">{order.id}</span>
                  </div>
                  {order.priority && (
                    <AlertCircle className="w-5 h-5 text-status-warning" />
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {order.time}
                  </div>
                  <Button
                    size="sm"
                    className="gradient-primary"
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                  >
                    Start Preparing
                  </Button>
                </div>
              </div>
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
              <div
                key={order.id}
                className={`bg-card border border-border rounded-xl p-4 border-l-4 ${getStatusBorderColor(order.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Table {order.tableNumber}</Badge>
                    <span className="text-sm text-muted-foreground">{order.id}</span>
                  </div>
                  <Badge className={getStatusColor(order.status)}>In Progress</Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">×{item.quantity}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-status-warning mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {order.time}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-status-success hover:bg-status-success/80 text-white"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Ready
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-success" />
            <h2 className="font-semibold text-foreground">Ready to Serve</h2>
            <Badge variant="outline">{readyOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders ready yet</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-card border border-status-success/30 rounded-xl p-4 border-l-4 ${getStatusBorderColor(order.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Table {order.tableNumber}</Badge>
                      <span className="text-sm text-muted-foreground">{order.id}</span>
                    </div>
                    <Badge className={getStatusColor(order.status)}>Ready</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenPage;
