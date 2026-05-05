import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import CustomerInstructionsModal from "@/components/CustomerInstructionsModal";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { useOrders, useUpdateItemPrep, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order, OrderItem } from "@/types/order";

const KitchenPage = () => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const [instructionsModal, setInstructionsModal] = useState<{
    open: boolean;
    instructions: string;
  }>({ open: false, instructions: "" });
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Active kitchen queue: pending + preparing only. Polling every 5s.
  const { data: activePage, isLoading } = useOrders(
    { status: "pending,preparing", limit: 50 },
    5000,
  );
  // Recently completed: ready + served (kitchen-side history).
  const { data: recentPage } = useOrders(
    { status: "ready,served", limit: 10 },
    10000,
  );

  const orders = activePage?.data ?? [];
  const completedOrders = recentPage?.data ?? [];

  const updateItemPrep = useUpdateItemPrep();
  const updateOrderStatus = useUpdateOrderStatus();

  const elapsedSeconds = (createdAt: string) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const itemReady = (order: Order, item: OrderItem) => {
    const next = item.prepStatus === "ready" ? "preparing" : "ready";
    updateItemPrep.mutate({ orderId: order.id, itemId: item.id, prepStatus: next });
  };

  const startPreparing = (order: Order) => {
    if (order.status === "pending") {
      updateOrderStatus.mutate({ id: order.id, status: "preparing" });
    }
  };

  const markServed = (order: Order) => {
    setConfirmDialog({
      open: true,
      title: "Mark as served",
      description: `Mark order #${order.orderNumber} as served?`,
      action: () =>
        updateOrderStatus.mutate({ id: order.id, status: "served" }),
    });
  };

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
                  <ChefHat className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Kitchen</h1>
                  <p className="text-xs text-muted-foreground">
                    {orders.length} active{orders.length === 1 ? " order" : " orders"}
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        {isLoading && (
          <p className="text-center text-muted-foreground py-8">Loading orders...</p>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No active kitchen orders.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const elapsed = elapsedSeconds(order.createdAt);
            const isLate = elapsed > 15 * 60; // 15 min threshold
            const allReady = order.items.every((i) => i.prepStatus === "ready");

            return (
              <div
                key={order.id}
                className={`bg-card border rounded-2xl p-4 ${
                  isLate ? "border-status-error" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">#{order.orderNumber}</h3>
                      {order.status === "pending" && (
                        <Badge className="bg-status-warning/10 text-status-warning">New</Badge>
                      )}
                      {order.status === "preparing" && (
                        <Badge className="bg-status-info/10 text-status-info">Preparing</Badge>
                      )}
                      {isLate && (
                        <Badge className="bg-status-error/10 text-status-error">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Late
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.tableNumber ? `Table ${order.tableNumber}` : "Counter / Takeout"}
                      {order.staffName ? ` • ${order.staffName}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 text-sm font-mono ${
                        isLate ? "text-status-error" : "text-foreground"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {formatElapsed(elapsed)}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <button
                    onClick={() =>
                      setInstructionsModal({ open: true, instructions: order.notes ?? "" })
                    }
                    className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-warning/10 text-status-warning text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Customer instructions
                  </button>
                )}

                <ul className="space-y-1.5 mb-4">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        item.prepStatus === "ready" ? "bg-status-success/5 line-through opacity-70" : "bg-secondary/30"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.quantity}× {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground truncate">{item.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={updateItemPrep.isPending}
                        onClick={() => itemReady(order, item)}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            item.prepStatus === "ready" ? "text-status-success" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button
                      onClick={() => startPreparing(order)}
                      className="flex-1 rounded-xl"
                      disabled={updateOrderStatus.isPending}
                    >
                      Start preparing
                    </Button>
                  )}
                  {order.status === "preparing" && allReady && (
                    <Button
                      onClick={() => markServed(order)}
                      className="flex-1 rounded-xl bg-status-success text-white hover:bg-status-success/90"
                    >
                      Mark served
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {completedOrders.length > 0 && (
          <section className="mt-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recently completed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {completedOrders.map((o) => (
                <div
                  key={o.id}
                  className="bg-card border border-border rounded-xl p-3 opacity-70"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">#{o.orderNumber}</span>
                    <Badge className="text-xs">{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.items.length} items</p>
                </div>
              ))}
            </div>
          </section>
        )}
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
      <CustomerInstructionsModal
        open={instructionsModal.open}
        onClose={() => setInstructionsModal({ open: false, instructions: "" })}
        instructions={instructionsModal.instructions}
      />
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Kitchen"
        resourceType="order"
      />
    </div>
  );
};

export default KitchenPage;
