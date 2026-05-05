import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  MapPin,
  TrendingUp,
  TrendingDown,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Repeat,
  Wrench,
  ShoppingCart,
} from "lucide-react";
import { useMovementsForIngredient } from "@/hooks/useMovements";
import type { IngredientMovement, MovementType } from "@/types/movement";

interface ItemDetailsProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string;
    locationName: string;
  } | null;
}

const ItemDetailsModal = ({ open, onClose, item }: ItemDetailsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: page, isLoading } = useMovementsForIngredient(
    open ? item?.id : undefined,
    { limit: 50 },
  );
  const movements: IngredientMovement[] = page?.data ?? [];

  if (!item) return null;

  const typeIcon = (t: MovementType) => {
    switch (t) {
      case "intake":
        return <ArrowDownLeft className="w-4 h-4 text-status-success" />;
      case "consumption":
        return <ShoppingCart className="w-4 h-4 text-primary" />;
      case "waste":
        return <Trash2 className="w-4 h-4 text-destructive" />;
      case "transfer":
        return <Repeat className="w-4 h-4 text-status-info" />;
      case "correction":
        return <Wrench className="w-4 h-4 text-status-warning" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const typeColor = (t: MovementType) => {
    switch (t) {
      case "intake":
        return "bg-status-success/10 text-status-success";
      case "consumption":
        return "bg-primary/10 text-primary";
      case "waste":
        return "bg-destructive/10 text-destructive";
      case "transfer":
        return "bg-status-info/10 text-status-info";
      case "correction":
        return "bg-status-warning/10 text-status-warning";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} at ${d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // 30-day rollup buckets.
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = movements.filter((m) => new Date(m.createdAt).getTime() >= cutoff);
  const inflow30 = recent
    .filter((m) => m.quantity > 0)
    .reduce((s, m) => s + m.quantity, 0);
  const consumed30 = recent
    .filter((m) => m.type === "consumption")
    .reduce((s, m) => s + Math.abs(m.quantity), 0);
  const wasted30 = recent
    .filter((m) => m.type === "waste")
    .reduce((s, m) => s + Math.abs(m.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Package className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <span className="text-foreground">{item.name}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {item.category}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-card">
              Movement History
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-foreground">Current Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-semibold text-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{item.locationName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-status-success/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-status-success">
                    +{inflow30.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Received (30d)</p>
                </div>
                <div className="bg-status-warning/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-status-warning">
                    -{consumed30.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Used (30d)</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">
                    -{wasted30.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Wasted (30d)</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Recent Activity</h4>
                {isLoading && (
                  <p className="text-sm text-muted-foreground py-4">Loading...</p>
                )}
                {!isLoading && movements.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">
                    No movements recorded yet.
                  </p>
                )}
                {movements.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl"
                  >
                    {m.quantity > 0 ? (
                      <TrendingUp className="w-4 h-4 text-status-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-status-error" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground capitalize">
                        {m.type} {Math.abs(m.quantity)} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.staffName ?? "—"} · {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-3">
              {isLoading && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Loading...
                </p>
              )}
              {!isLoading && movements.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No movement history.
                </p>
              )}
              {movements.map((m) => (
                <div key={m.id} className="bg-secondary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColor(m.type)}`}
                    >
                      {typeIcon(m.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`${typeColor(m.type)} rounded-lg capitalize`}>
                          {m.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {m.quantity > 0 ? "+" : ""}
                        {m.quantity} {item.unit}
                        <span className="text-muted-foreground ml-2">
                          (was {m.previousStock} → now {m.newStock})
                        </span>
                      </p>
                      {m.referenceType && m.referenceId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {m.referenceType} {m.referenceId.slice(0, 8)}
                        </p>
                      )}
                      {m.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {m.reason}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {m.staffName ?? "System"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
