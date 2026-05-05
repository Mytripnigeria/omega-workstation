import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Trash2,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Filter,
  Wrench,
  Repeat,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { workstationAuth } from "@/services/api";
import { useMovements } from "@/hooks/useMovements";
import type { IngredientMovement, MovementType } from "@/types/movement";

interface InventoryMovementLogProps {
  /** Optional: scope log to a single ingredient (used inside ItemDetailsModal). */
  ingredientId?: string;
}

const TYPE_LABELS: Record<MovementType, string> = {
  intake: "Intake",
  consumption: "Consumption",
  waste: "Waste",
  transfer: "Transfer",
  correction: "Correction",
};

const ALL = "__all__";

const InventoryMovementLog = ({ ingredientId }: InventoryMovementLogProps) => {
  const staff = workstationAuth.getStaff();
  const [typeFilter, setTypeFilter] = useState<MovementType | typeof ALL>(ALL);

  const { data, isLoading } = useMovements({
    storeId: staff?.storeId,
    ingredientId,
    type: typeFilter === ALL ? undefined : (typeFilter as MovementType),
    limit: 100,
  });

  const movements: IngredientMovement[] = data?.data ?? [];

  const getTypeConfig = (type: MovementType) => {
    switch (type) {
      case "intake":
        return {
          icon: ArrowDownLeft,
          label: "Intake",
          color: "bg-status-success/10 text-status-success",
        };
      case "consumption":
        return {
          icon: ShoppingCart,
          label: "Consumption",
          color: "bg-primary/10 text-primary",
        };
      case "waste":
        return {
          icon: Trash2,
          label: "Waste",
          color: "bg-status-error/10 text-status-error",
        };
      case "transfer":
        return {
          icon: Repeat,
          label: "Transfer",
          color: "bg-category-lavender/30 text-category-lavender",
        };
      case "correction":
        return {
          icon: Wrench,
          label: "Correction",
          color: "bg-status-warning/10 text-status-warning",
        };
      default:
        return {
          icon: ArrowRight,
          label: type,
          color: "bg-secondary text-foreground",
        };
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const columns = [
    {
      key: "createdAt",
      label: "Time",
      sortable: true,
      render: (m: IngredientMovement) => (
        <span className="text-muted-foreground text-sm">{formatTime(m.createdAt)}</span>
      ),
    },
    {
      key: "ingredientName",
      label: "Item",
      sortable: true,
      render: (m: IngredientMovement) => (
        <span className="font-medium text-foreground">
          {m.ingredientName ?? "Ingredient"}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (m: IngredientMovement) => {
        const config = getTypeConfig(m.type);
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} rounded-lg flex items-center gap-1 w-fit`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "quantity",
      label: "Change",
      sortable: true,
      render: (m: IngredientMovement) => {
        const positive = m.quantity > 0;
        return (
          <div className="flex items-center gap-1">
            {positive ? (
              <TrendingUp className="w-4 h-4 text-status-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-status-error" />
            )}
            <span
              className={`font-semibold ${
                positive ? "text-status-success" : "text-status-error"
              }`}
            >
              {positive ? "+" : ""}
              {m.quantity} {m.ingredientUnit ?? ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "balance",
      label: "Balance",
      render: (m: IngredientMovement) => (
        <div className="text-sm">
          <span className="text-muted-foreground">{m.previousStock}</span>
          <span className="mx-1 text-muted-foreground">→</span>
          <span className="font-semibold text-foreground">
            {m.newStock} {m.ingredientUnit ?? ""}
          </span>
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (m: IngredientMovement) => (
        <div className="text-sm text-muted-foreground max-w-[200px]">
          {m.referenceType && m.referenceId && (
            <span>
              {m.referenceType} {m.referenceId.slice(0, 8)}
            </span>
          )}
          {m.reason && <span className="line-clamp-1">{m.reason}</span>}
          {!m.referenceType && !m.reason && "—"}
        </div>
      ),
    },
    {
      key: "staffName",
      label: "By",
      sortable: true,
      render: (m: IngredientMovement) => (
        <span className="text-muted-foreground">{m.staffName ?? "—"}</span>
      ),
    },
  ];

  // Summary stats over the loaded window.
  const totalInflow = movements
    .filter((m) => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOutflow = movements
    .filter((m) => m.quantity < 0)
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  const totalWaste = movements
    .filter((m) => m.type === "waste")
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-success/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalInflow.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Inflow</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalOutflow.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Outflow</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-error/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-status-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalWaste.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Waste</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as MovementType | typeof ALL)}
        >
          <SelectTrigger className="w-[180px] rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Types</SelectItem>
            {(Object.keys(TYPE_LABELS) as MovementType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : (
        <DataTable
          data={movements}
          columns={columns}
          searchKeys={["ingredientName", "staffName", "reason", "referenceType"]}
          pageSize={20}
          emptyMessage="No movement records found"
        />
      )}
    </div>
  );
};

export default InventoryMovementLog;
