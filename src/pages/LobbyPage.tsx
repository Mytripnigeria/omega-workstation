import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Monitor,
  Globe,
  Utensils,
  Bike,
  ShoppingBag,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { useOrders } from "@/hooks/useOrders";
import { useFunctionAccess } from "@/hooks/useFunctionAccess";
import { canAccessFunction } from "@/lib/roles";
import FunctionRestricted from "@/components/FunctionRestricted";
import type { Order } from "@/types/order";

const LobbyPage = () => {
  const navigate = useNavigate();
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Merchant-configured role restriction (workstation settings).
  const { data: functionAccess } = useFunctionAccess();
  const lobbyAllowed = canAccessFunction(
    functionAccess?.functionRoleAccess,
    "lobby",
  );

  // Show open orders that haven't been served yet — what the customer is "waiting on".
  const { data: page, isLoading } = useOrders(
    { status: "preparing,ready", limit: 50 },
    5000,
  );

  // 1s tick so timers update in real time.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const DEFAULT_PREP_MINUTES = 15;
  const elapsedMin = (createdAt: string) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  // Same semantics as the kitchen board: the order's own prep estimate,
  // anchored to when prep actually started (fallbacks: 15 min / createdAt).
  const remainingSec = (o: Order) =>
    (o.estimatedPrepMinutes ?? DEFAULT_PREP_MINUTES) * 60 -
    Math.floor(
      (Date.now() - new Date(o.preparingStartedAt ?? o.createdAt).getTime()) / 1000,
    );
  const fmtSec = (s: number) => {
    const neg = s < 0;
    const a = Math.abs(s);
    const totalMin = Math.floor(a / 60);
    const secs = String(a % 60).padStart(2, "0");
    if (totalMin >= 60) {
      const h = Math.floor(totalMin / 60);
      const m = String(totalMin % 60).padStart(2, "0");
      return `${neg ? "-" : ""}${h}H ${m}:${secs}`;
    }
    return `${neg ? "-" : ""}${totalMin}:${secs}`;
  };
  const formatWaitHM = (minutes: number) => {
    const m = Math.max(0, Math.floor(minutes));
    if (m < 60) return `${m}Min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h}H` : `${h}H, ${rem}Min`;
  };

  // Ready first (oldest waiting first), then preparing (most late first).
  const all = page?.data ?? [];
  const readyOrders = all
    .filter((o) => o.status === "ready")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const preparingOrders = all
    .filter((o) => o.status === "preparing")
    .sort((a, b) => remainingSec(a) - remainingSec(b));
  const orders = [...readyOrders, ...preparingOrders];

  const channelIcon = (channel: Order["channel"]) => {
    if (channel === "pos") return <Monitor className="w-3 h-3" />;
    if (channel === "website") return <Globe className="w-3 h-3" />;
    return <Globe className="w-3 h-3" />;
  };

  const orderType = (o: Order): { icon: React.ReactNode; label: string } => {
    if (o.isDelivery) return { icon: <Bike className="w-4 h-4" />, label: "Delivery" };
    if (o.tableNumber) return { icon: <Utensils className="w-4 h-4" />, label: "Dine-in" };
    return { icon: <ShoppingBag className="w-4 h-4" />, label: "Takeaway" };
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "ready":
        return "bg-status-success/10 text-status-success";
      case "preparing":
        return "bg-status-info/10 text-status-info";
      case "pending":
        return "bg-status-warning/10 text-status-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!lobbyAllowed) {
    return <FunctionRestricted label="Lobby" />;
  }

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
                  <h1 className="text-lg font-bold text-foreground">Customer Lobby</h1>
                  <p className="text-xs text-muted-foreground">
                    {orders.length} customer{orders.length === 1 ? "" : "s"} waiting
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
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No customers in the queue right now.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {orders.map((order) => {
            const elapsed = elapsedMin(order.createdAt);
            const t = orderType(order);
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName ?? "Walk-in customer"}
                    </p>
                  </div>
                  <Badge className={`${statusColor(order.status)} capitalize`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    {t.icon}
                    {t.label}
                  </span>
                  <span className="flex items-center gap-1">
                    {channelIcon(order.channel)}
                    {order.channel.toUpperCase()}
                  </span>
                  {order.tableNumber && (
                    <span>Table {order.tableNumber}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {order.status === "ready" ? (
                    <div className="flex items-center gap-1 text-sm font-medium text-status-success">
                      <Clock className="w-4 h-4" />
                      Ready · waiting {formatWaitHM(elapsed)}
                    </div>
                  ) : (
                    (() => {
                      const rem = remainingSec(order);
                      const late = rem < 0;
                      return (
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            late ? "text-status-error" : "text-muted-foreground"
                          }`}
                        >
                          {late ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {fmtSec(rem)}
                        </div>
                      );
                    })()
                  )}
                  <span className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Customer Lobby"
        resourceType="order"
      />
    </div>
  );
};

export default LobbyPage;
