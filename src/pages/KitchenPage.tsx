import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, ChefHat, GripVertical, RotateCcw, MessageSquare, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import CustomerInstructionsModal from "@/components/CustomerInstructionsModal";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { useOrders, useUpdateItemPrep, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useFunctionAccess } from "@/hooks/useFunctionAccess";
import { canAccessFunction } from "@/lib/roles";
import FunctionRestricted from "@/components/FunctionRestricted";
import { workstationAuth } from "@/services/api";
import type { Order as ApiOrder, OrderStatus as ApiOrderStatus } from "@/types/order";

// Default estimate used for the per-order prep countdown. The backend order
// payload does not yet carry a per-order prep time, so the board uses a single
// default to drive the original countdown design.
const DEFAULT_PREP_MINUTES = 15;

// New orders left un-started this long count as late (red treatment + beep).
const PENDING_LATE_SECONDS = 5 * 60;

function variationLabel(variation?: Record<string, unknown> | null): string | null {
  if (!variation) return null;
  const name = (variation as { name?: unknown }).name;
  return typeof name === "string" && name.trim() ? name : null;
}
function addonsLabel(addons?: Record<string, unknown>[] | null): string | null {
  if (!addons || addons.length === 0) return null;
  const names = addons.map((a) => (a as { name?: unknown }).name).filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  return names.length ? names.join(", ") : null;
}

type KitchenStatus = "new" | "preparing" | "ready" | "completed" | "delayed";

interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  completed: boolean;
  variation?: Record<string, unknown> | null;
  addons?: Record<string, unknown>[] | null;
}

interface KitchenOrder {
  id: string;            // backend UUID — used for mutations
  displayId: string;     // "#26678"
  tableNumber: string;
  items: KitchenOrderItem[];
  startTime: Date;       // countdown anchor: when prep began (else order creation)
  createdAt: Date;       // when the order was placed — drives the pending count-up
  estimatedMinutes: number;
  /** Whether the order has entered PREPARING — the countdown only ticks then. */
  prepStarted: boolean;
  status: KitchenStatus;
  priority: boolean;
  preparingStaffId?: string;
  preparingStaffName?: string;
  customerInstructions?: string;
}

/** Maps a live backend order onto the kitchen board view model. */
function toKitchenOrder(o: ApiOrder): KitchenOrder {
  const status: KitchenStatus =
    o.status === "ready"
      ? "ready"
      : o.status === "preparing"
        ? "preparing"
        : o.status === "served" || o.status === "completed"
          ? "completed"
          : "new";
  return {
    id: o.id,
    displayId: `#${o.orderNumber}`,
    tableNumber: o.tableNumber ?? (o.isDelivery ? "Delivery" : "Counter"),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      notes: i.notes ?? undefined,
      completed: i.prepStatus === "ready",
      variation: i.variation,
      addons: i.addons,
    })),
    // Anchor the countdown to when prep started; fall back to creation only so
    // the field is always a Date (the countdown stays full until prepStarted).
    startTime: new Date(o.preparingStartedAt ?? o.createdAt),
    createdAt: new Date(o.createdAt),
    estimatedMinutes: o.estimatedPrepMinutes ?? DEFAULT_PREP_MINUTES,
    prepStarted: !!o.preparingStartedAt,
    status,
    priority: false,
    // Prefer the staff who actually started prep; fall back to the order creator
    // until the backend exposes preparingStaffId/Name.
    preparingStaffId: o.preparingStaffId ?? o.staffId ?? undefined,
    preparingStaffName: o.preparingStaffName ?? o.staffName ?? undefined,
    customerInstructions: o.notes ?? undefined,
  };
}

const KitchenPage = () => {
  const navigate = useNavigate();

  // Merchant-configured role restriction (workstation settings).
  const { data: functionAccess } = useFunctionAccess();
  const kitchenAllowed = canAccessFunction(
    functionAccess?.functionRoleAccess,
    "kitchen",
  );

  const sessionStaff = workstationAuth.getStaff();
  const currentStaffId = sessionStaff?.id ?? "";
  const currentStaffName = sessionStaff
    ? `${sessionStaff.firstName} ${sessionStaff.lastName}`.trim()
    : "";

  // Live data. Active board = pending/preparing/ready; recently completed =
  // served (kitchen-side handoff history that can be recalled).
  const { data: activePage } = useOrders(
    { status: "pending,preparing,ready", limit: 50 },
    5000,
  );
  const { data: recentPage } = useOrders({ status: "served", limit: 10 }, 10000);

  const updateItemPrep = useUpdateItemPrep();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const orders: KitchenOrder[] = (activePage?.data ?? []).map(toKitchenOrder);
  const completedOrders: KitchenOrder[] = (recentPage?.data ?? []).map(toKitchenOrder);

  // Local-only display ordering for drag-to-reorder within a card. Keyed by
  // backend order id → ordered item ids. Survives polling refetches.
  const [itemOrder, setItemOrder] = useState<Record<string, string[]>>({});
  const [draggedItem, setDraggedItem] = useState<{ orderId: string; itemId: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [instructionsModal, setInstructionsModal] = useState<{ open: boolean; orderId: string; instructions: string }>({ open: false, orderId: "", instructions: "" });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Late-order beep. Browsers block audio until a user gesture, so the
  // AudioContext is created/resumed lazily on the first interaction and every
  // audio call fails silently if the browser refuses.
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const unlock = () => {
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        if (audioCtxRef.current.state === "suspended") void audioCtxRef.current.resume();
      } catch {
        // Audio unavailable — the beep is best-effort only.
      }
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  const getRemainingSeconds = (order: KitchenOrder) => {
    // Until prep actually begins, show the full estimated time (not ticking).
    if (!order.prepStarted) return order.estimatedMinutes * 60;
    const elapsed = Math.floor((Date.now() - order.startTime.getTime()) / 1000);
    return order.estimatedMinutes * 60 - elapsed;
  };

  // How long a new order has been waiting for someone to start prep (counts up).
  const getPendingSeconds = (order: KitchenOrder) =>
    Math.floor((Date.now() - order.createdAt.getTime()) / 1000);

  const isOrderLate = (order: KitchenOrder) =>
    order.status === "preparing"
      ? getRemainingSeconds(order) < 0
      : order.status === "new" && getPendingSeconds(order) > PENDING_LATE_SECONDS;

  const formatCountdown = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const orderedItems = (order: KitchenOrder) => {
    const ids = itemOrder[order.id];
    if (!ids) return order.items;
    const byId = new Map(order.items.map((i) => [i.id, i]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as KitchenOrderItem[];
    // Append any items not yet in the local order map (e.g. new items).
    for (const i of order.items) if (!ids.includes(i.id)) ordered.push(i);
    return ordered;
  };

  const changeStatus = (id: string, status: ApiOrderStatus, label: KitchenStatus) => {
    setConfirmDialog({
      open: true,
      title: label === "completed" ? "Complete Order" : "Update Order",
      description: `Are you sure you want to mark this order as ${label}?`,
      action: () => updateOrderStatusMutation.mutate({ id, status }),
    });
  };

  const recallOrder = (orderId: string) => {
    setConfirmDialog({
      open: true,
      title: "Recall Order",
      description: "This will move the order back to the board. Continue?",
      action: () => updateOrderStatusMutation.mutate({ id: orderId, status: "preparing" }),
    });
  };

  const toggleItemComplete = (order: KitchenOrder, itemId: string) => {
    const item = order.items.find((i) => i.id === itemId);
    if (!item) return;
    updateItemPrep.mutate({
      orderId: order.id,
      itemId,
      prepStatus: item.completed ? "preparing" : "ready",
    });
  };

  const reorderItems = (order: KitchenOrder, fromIndex: number, toIndex: number) => {
    const current = orderedItems(order).map((i) => i.id);
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setItemOrder((prev) => ({ ...prev, [order.id]: current }));
  };

  const getStaffDisplay = (order: KitchenOrder) => {
    if (!order.preparingStaffId) return null;
    return order.preparingStaffId === currentStaffId ? "Myself" : order.preparingStaffName;
  };

  const getStatusBorderColor = (status: KitchenStatus, late: boolean) => {
    if (late) return "border-l-destructive";
    switch (status) {
      case "new": return "border-l-status-warning";
      case "preparing": return "border-l-status-process";
      case "ready":
      case "completed": return "border-l-status-success";
      case "delayed": return "border-l-destructive";
    }
  };

  // Backend returns newest-first; the board wants oldest first (New) and
  // most-late first (Preparing/Delayed — ascending remaining time).
  const newOrders = orders
    .filter((o) => o.status === "new")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const preparingOrders = orders
    .filter((o) => o.status === "preparing")
    .sort((a, b) => getRemainingSeconds(a) - getRemainingSeconds(b));
  const delayedOrders = preparingOrders.filter((o) => getRemainingSeconds(o) < 0);
  const onTimeOrders = preparingOrders.filter((o) => getRemainingSeconds(o) >= 0);
  const readyOrders = orders.filter((o) => o.status === "ready");

  // Repeat a short beep while any order is late (prep overdue or pending too long).
  const anyLate = orders.some(isOrderLate);

  useEffect(() => {
    if (!anyLate) return;
    const beep = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== "running") return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // Fail silently — the board must keep working without sound.
      }
    };
    beep();
    const interval = setInterval(beep, 5000);
    return () => clearInterval(interval);
  }, [anyLate]);

  const OrderCard = ({ order, showActions = true }: { order: KitchenOrder; showActions?: boolean }) => {
    const remaining = getRemainingSeconds(order);
    const isDelayed = isOrderLate(order);
    // New orders count UP how long they've been waiting; preparing counts down.
    const timerSeconds = order.status === "new" ? getPendingSeconds(order) : remaining;
    const items = orderedItems(order);

    return (
      <div className={`bg-card border border-border rounded-2xl p-4 border-l-4 ${getStatusBorderColor(order.status, isDelayed)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-lg font-semibold">Table {order.tableNumber}</Badge>
            <span className="text-sm text-muted-foreground">{order.displayId}</span>
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
            <span className={`font-mono font-bold ${isDelayed ? "text-destructive" : "text-foreground"}`}>{formatCountdown(timerSeconds)}</span>
            {isDelayed && <Badge className="bg-destructive text-destructive-foreground text-xs rounded-lg">DELAYED</Badge>}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={order.status === "preparing"}
              onDragStart={() => setDraggedItem({ orderId: order.id, itemId: item.id })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedItem && draggedItem.orderId === order.id) {
                  const fromIndex = items.findIndex((i) => i.id === draggedItem.itemId);
                  reorderItems(order, fromIndex, idx);
                }
                setDraggedItem(null);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${order.status === "preparing" ? "hover:bg-muted cursor-grab" : "bg-muted/50"} ${item.completed ? "opacity-50" : ""}`}
            >
              {order.status === "preparing" && (
                <>
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => toggleItemComplete(order, item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? "bg-status-success border-status-success" : "border-border hover:border-primary"}`}
                  >
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                </>
              )}
              <div
                className={`flex-1 min-w-0 ${order.status === "preparing" ? "cursor-pointer" : ""}`}
                onClick={() => {
                  // Tapping the item text ticks it, same as the checkbox.
                  if (order.status === "preparing") toggleItemComplete(order, item.id);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-foreground font-medium ${item.completed ? "line-through" : ""}`}>{item.name}</span>
                  <span className="text-muted-foreground flex-shrink-0">×{item.quantity}</span>
                </div>
                {variationLabel(item.variation) && (
                  <p className="text-xs text-muted-foreground mt-1">{variationLabel(item.variation)}</p>
                )}
                {addonsLabel(item.addons) && (
                  <p className="text-xs text-muted-foreground mt-1">+ {addonsLabel(item.addons)}</p>
                )}
                {item.notes && <p className="text-xs text-status-warning mt-1">Note: {item.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        {showActions && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Est: {order.estimatedMinutes} min</div>
            {order.status === "new" && (
              <Button size="sm" className="rounded-xl" onClick={() => changeStatus(order.id, "preparing", "preparing")}>
                Start Preparing
              </Button>
            )}
            {order.status === "preparing" && (
              <Button size="sm" className="rounded-xl bg-status-success hover:bg-status-success/90" onClick={() => changeStatus(order.id, "ready", "ready")}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Ready
              </Button>
            )}
            {order.status === "ready" && (
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => changeStatus(order.id, "served", "completed")}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!kitchenAllowed) {
    return <FunctionRestricted label="Kitchen" />;
  }

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
          <ActivityLogButton onClick={() => setShowActivityLog(true)} />
        </div>
      </header>

      {/* Content */}
      <main className="page-container">
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
                            <span className="text-sm text-muted-foreground">{order.displayId}</span>
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
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Kitchen Display" resourceType="order" />
    </div>
  );
};

export default KitchenPage;
