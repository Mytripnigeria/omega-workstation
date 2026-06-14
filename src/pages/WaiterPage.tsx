import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  Utensils,
  Bike,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order } from "@/types/order";

const WaiterPage = () => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ open: false, type: "success", title: "" });
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Ready orders, polled every 5s, oldest first (longest-waiting at the top).
  const { data: readyPage, isLoading } = useOrders({ status: "ready", limit: 50 }, 5000);
  const orders = [...(readyPage?.data ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const updateStatus = useUpdateOrderStatus();

  // 1s tick so the "waiting" timers count up in real time.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const orderTypeOf = (o: Order): "dine-in" | "takeaway" | "delivery" =>
    o.isDelivery ? "delivery" : o.tableNumber ? "dine-in" : "takeaway";

  const getOrderTypeIcon = (type: "dine-in" | "takeaway" | "delivery") => {
    if (type === "dine-in") return <Utensils className="w-4 h-4" />;
    if (type === "takeaway") return <ShoppingBag className="w-4 h-4" />;
    return <Bike className="w-4 h-4" />;
  };

  const orderTypeLabel = (type: "dine-in" | "takeaway" | "delivery") =>
    type === "dine-in" ? "Dine In" : type === "takeaway" ? "Takeaway" : "Delivery";

  const handleServe = (order: Order) => {
    // Delivery orders go out for delivery; dine-in/takeaway complete immediately.
    const isDelivery = order.isDelivery;
    const nextStatus = isDelivery ? "delivering" : "completed";
    setConfirmDialog({
      open: true,
      title: isDelivery ? "Send for delivery" : "Serve Order",
      description: isDelivery
        ? `Mark order #${order.orderNumber} as out for delivery?`
        : `Mark order #${order.orderNumber} as served?`,
      action: () => {
        updateStatus.mutate(
          { id: order.id, status: nextStatus },
          {
            onSuccess: () =>
              setToast({
                open: true,
                type: "success",
                title: isDelivery ? "Out for delivery" : "Order served",
                message: `#${order.orderNumber} updated.`,
              }),
            onError: (e: Error) =>
              setToast({
                open: true,
                type: "error",
                title: "Couldn't serve",
                message: e.message,
              }),
          },
        );
      },
    });
  };

  const elapsedMin = (createdAt: string) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Users className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Waiter</h1>
                  <p className="text-xs text-muted-foreground">
                    {orders.length} ready to serve
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container">
        {isLoading && (
          <p className="text-center text-muted-foreground py-8">Loading orders...</p>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No orders ready to serve right now.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {orders.map((order) => {
            const orderType = orderTypeOf(order);
            const elapsed = elapsedMin(order.createdAt);
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.customerName ?? "Walk-in customer"}
                    </p>
                  </div>
                  <Badge className="bg-status-success/10 text-status-success">Ready</Badge>
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {getOrderTypeIcon(orderType)}
                    {orderTypeLabel(orderType)}
                  </div>
                  {order.tableNumber && <span>Table {order.tableNumber}</span>}
                  <div
                    className={`flex items-center gap-1 ml-auto font-medium ${
                      elapsed >= 5 ? "text-status-error" : ""
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Waiting {elapsed} min
                  </div>
                </div>

                <ul className="space-y-1 mb-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.quantity}× {item.name}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-muted-foreground italic">{item.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-3 border-t border-border mb-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    ₦{order.total.toLocaleString()}
                  </span>
                </div>

                <Button
                  className="w-full rounded-xl"
                  onClick={() => handleServe(order)}
                  disabled={updateStatus.isPending}
                >
                  {orderType === "delivery" ? "Send for delivery" : "Mark as served"}
                </Button>
              </div>
            );
          })}
        </div>
      </main>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
      <ToastNotification
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Waiter"
        resourceType="order"
      />
    </div>
  );
};

export default WaiterPage;
