import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Trash2, RotateCcw, ShoppingCart, Package, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";

interface MovementRecord {
  id: string;
  itemName: string;
  itemId: string;
  type: "inflow" | "outflow" | "sale" | "waste" | "return" | "order";
  quantity: number;
  unit: string;
  previousQty: number;
  newQty: number;
  source?: string;
  destination?: string;
  reference?: string;
  notes?: string;
  timestamp: Date;
  performedBy: string;
}

const mockMovements: MovementRecord[] = [
  {
    id: "mv1",
    itemName: "Diced Tomatoes",
    itemId: "1",
    type: "inflow",
    quantity: 15,
    unit: "kg",
    previousQty: 10,
    newQty: 25,
    source: "Store Room 1",
    destination: "Prep Station",
    timestamp: new Date(Date.now() - 30 * 60000),
    performedBy: "John A.",
  },
  {
    id: "mv2",
    itemName: "Marinated Chicken",
    itemId: "2",
    type: "sale",
    quantity: 4,
    unit: "kg",
    previousQty: 12,
    newQty: 8,
    reference: "Order #1234",
    timestamp: new Date(Date.now() - 45 * 60000),
    performedBy: "Kitchen",
  },
  {
    id: "mv3",
    itemName: "Sliced Onions",
    itemId: "3",
    type: "waste",
    quantity: 2,
    unit: "kg",
    previousQty: 7,
    newQty: 5,
    notes: "Spoiled - not refrigerated properly",
    timestamp: new Date(Date.now() - 60 * 60000),
    performedBy: "Sarah O.",
  },
  {
    id: "mv4",
    itemName: "Prepped Rice",
    itemId: "4",
    type: "return",
    quantity: 5,
    unit: "kg",
    previousQty: 15,
    newQty: 10,
    destination: "Store Room 2",
    notes: "Excess preparation",
    timestamp: new Date(Date.now() - 90 * 60000),
    performedBy: "Mike B.",
  },
  {
    id: "mv5",
    itemName: "Diced Tomatoes",
    itemId: "1",
    type: "order",
    quantity: 8,
    unit: "kg",
    previousQty: 25,
    newQty: 17,
    reference: "Order #1235",
    timestamp: new Date(Date.now() - 120 * 60000),
    performedBy: "Kitchen",
  },
  {
    id: "mv6",
    itemName: "Marinated Chicken",
    itemId: "2",
    type: "inflow",
    quantity: 10,
    unit: "kg",
    previousQty: 2,
    newQty: 12,
    source: "Main Freezer",
    destination: "Kitchen Chiller",
    timestamp: new Date(Date.now() - 150 * 60000),
    performedBy: "John A.",
  },
];

const movementTypes = [
  { value: "all", label: "All Types" },
  { value: "inflow", label: "Inflow" },
  { value: "outflow", label: "Outflow" },
  { value: "sale", label: "Sales" },
  { value: "order", label: "Orders" },
  { value: "waste", label: "Waste" },
  { value: "return", label: "Returns" },
];

const InventoryMovementLog = () => {
  const [movements] = useState<MovementRecord[]>(mockMovements);
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMovements = movements.filter(
    (m) => typeFilter === "all" || m.type === typeFilter
  );

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "inflow":
        return {
          icon: ArrowDownLeft,
          label: "Inflow",
          color: "bg-status-success/10 text-status-success",
          sign: "+",
        };
      case "outflow":
        return {
          icon: ArrowUpRight,
          label: "Outflow",
          color: "bg-status-warning/10 text-status-warning",
          sign: "-",
        };
      case "sale":
        return {
          icon: ShoppingCart,
          label: "Sale",
          color: "bg-primary/10 text-primary",
          sign: "-",
        };
      case "order":
        return {
          icon: Package,
          label: "Order",
          color: "bg-status-info/10 text-status-info",
          sign: "-",
        };
      case "waste":
        return {
          icon: Trash2,
          label: "Waste",
          color: "bg-status-error/10 text-status-error",
          sign: "-",
        };
      case "return":
        return {
          icon: RotateCcw,
          label: "Return",
          color: "bg-category-lavender/30 text-category-lavender",
          sign: "-",
        };
      default:
        return {
          icon: ArrowRight,
          label: type,
          color: "bg-secondary text-foreground",
          sign: "",
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const columns = [
    {
      key: "timestamp",
      label: "Time",
      sortable: true,
      render: (item: MovementRecord) => (
        <span className="text-muted-foreground text-sm">{formatTime(item.timestamp)}</span>
      ),
    },
    {
      key: "itemName",
      label: "Item",
      sortable: true,
      render: (item: MovementRecord) => (
        <span className="font-medium text-foreground">{item.itemName}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item: MovementRecord) => {
        const config = getTypeConfig(item.type);
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
      render: (item: MovementRecord) => {
        const config = getTypeConfig(item.type);
        const isPositive = config.sign === "+";
        return (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-status-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-status-error" />
            )}
            <span className={`font-semibold ${isPositive ? "text-status-success" : "text-status-error"}`}>
              {config.sign}{item.quantity} {item.unit}
            </span>
          </div>
        );
      },
    },
    {
      key: "balance",
      label: "Balance",
      render: (item: MovementRecord) => (
        <div className="text-sm">
          <span className="text-muted-foreground">{item.previousQty}</span>
          <span className="mx-1 text-muted-foreground">→</span>
          <span className="font-semibold text-foreground">{item.newQty} {item.unit}</span>
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (item: MovementRecord) => (
        <div className="text-sm text-muted-foreground max-w-[200px]">
          {item.source && item.destination && (
            <span>{item.source} → {item.destination}</span>
          )}
          {item.reference && <span>{item.reference}</span>}
          {item.notes && <span className="line-clamp-1">{item.notes}</span>}
          {!item.source && !item.reference && !item.notes && "-"}
        </div>
      ),
    },
    {
      key: "performedBy",
      label: "By",
      sortable: true,
      render: (item: MovementRecord) => (
        <span className="text-muted-foreground">{item.performedBy}</span>
      ),
    },
  ];

  // Summary stats
  const totalInflow = filteredMovements
    .filter((m) => m.type === "inflow")
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOutflow = filteredMovements
    .filter((m) => ["outflow", "sale", "order", "waste"].includes(m.type))
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalWaste = filteredMovements
    .filter((m) => m.type === "waste")
    .reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-success/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalInflow}</p>
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
              <p className="text-2xl font-bold text-foreground">{totalOutflow}</p>
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
              <p className="text-2xl font-bold text-foreground">{totalWaste}</p>
              <p className="text-sm text-muted-foreground">Total Waste</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {movementTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Movement Table */}
      <DataTable
        data={filteredMovements}
        columns={columns}
        searchKeys={["itemName", "performedBy", "notes", "reference"]}
        pageSize={20}
        emptyMessage="No movement records found"
      />
    </div>
  );
};

export default InventoryMovementLog;