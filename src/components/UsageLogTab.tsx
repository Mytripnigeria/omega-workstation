import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, ArrowLeft, TrendingUp, TrendingDown, Package, Filter, Calendar } from "lucide-react";

interface MovementLog {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  type: "in" | "out" | "waste" | "adjustment";
  fromLocation?: string;
  toLocation?: string;
  reason?: string;
  performedBy: string;
  timestamp: Date;
}

const mockMovementLogs: MovementLog[] = [
  { id: "l1", itemName: "Tomatoes", category: "Produce", quantity: 10, unit: "kg", type: "out", fromLocation: "Store Room 1", toLocation: "Prep Station", performedBy: "John A.", timestamp: new Date(Date.now() - 30 * 60 * 1000) },
  { id: "l2", itemName: "Rice", category: "Grains", quantity: 50, unit: "kg", type: "in", toLocation: "Store Room 2", reason: "New stock received", performedBy: "Sarah O.", timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  { id: "l3", itemName: "Chicken Breast", category: "Meat", quantity: 5, unit: "kg", type: "out", fromLocation: "Main Freezer", toLocation: "Kitchen Chiller", performedBy: "Mike B.", timestamp: new Date(Date.now() - 90 * 60 * 1000) },
  { id: "l4", itemName: "Cooking Oil", category: "Oil", quantity: 2, unit: "L", type: "waste", fromLocation: "Store Room 1", reason: "Spoiled", performedBy: "Ada E.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "l5", itemName: "Onions", category: "Produce", quantity: 3, unit: "kg", type: "out", fromLocation: "Store Room 1", toLocation: "Prep Station", performedBy: "John A.", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  { id: "l6", itemName: "Plantain", category: "Produce", quantity: 20, unit: "bunches", type: "in", toLocation: "Store Room 1", reason: "Supplier delivery", performedBy: "Sarah O.", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: "l7", itemName: "Fish Fillet", category: "Seafood", quantity: 2, unit: "kg", type: "adjustment", fromLocation: "Main Freezer", reason: "Stock count correction", performedBy: "Manager", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: "l8", itemName: "Pepper", category: "Spices", quantity: 3, unit: "kg", type: "out", fromLocation: "Store Room 2", toLocation: "Prep Station", performedBy: "Mike B.", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
];

const UsageLogTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("today");

  const filteredLogs = mockMovementLogs.filter((log) => {
    const matchesSearch = log.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: MovementLog["type"]) => {
    switch (type) {
      case "in": return <ArrowLeft className="w-4 h-4 text-status-success" />;
      case "out": return <ArrowRight className="w-4 h-4 text-status-info" />;
      case "waste": return <TrendingDown className="w-4 h-4 text-destructive" />;
      case "adjustment": return <TrendingUp className="w-4 h-4 text-status-warning" />;
    }
  };

  const getTypeLabel = (type: MovementLog["type"]) => {
    switch (type) {
      case "in": return "Received";
      case "out": return "Moved Out";
      case "waste": return "Waste";
      case "adjustment": return "Adjustment";
    }
  };

  const getTypeColor = (type: MovementLog["type"]) => {
    switch (type) {
      case "in": return "bg-status-success/10 text-status-success";
      case "out": return "bg-status-info/10 text-status-info";
      case "waste": return "bg-destructive/10 text-destructive";
      case "adjustment": return "bg-status-warning/10 text-status-warning";
    }
  };

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Summary stats
  const todayIn = mockMovementLogs.filter(l => l.type === "in").length;
  const todayOut = mockMovementLogs.filter(l => l.type === "out").length;
  const todayWaste = mockMovementLogs.filter(l => l.type === "waste").length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-status-success/10 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ArrowLeft className="w-5 h-5 text-status-success" />
            <span className="text-2xl font-bold text-status-success">{todayIn}</span>
          </div>
          <p className="text-sm text-muted-foreground">Items In</p>
        </div>
        <div className="bg-status-info/10 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ArrowRight className="w-5 h-5 text-status-info" />
            <span className="text-2xl font-bold text-status-info">{todayOut}</span>
          </div>
          <p className="text-sm text-muted-foreground">Items Out</p>
        </div>
        <div className="bg-destructive/10 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">{todayWaste}</span>
          </div>
          <p className="text-sm text-muted-foreground">Waste</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-border"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in">Received</SelectItem>
            <SelectItem value="out">Moved Out</SelectItem>
            <SelectItem value="waste">Waste</SelectItem>
            <SelectItem value="adjustment">Adjustments</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger className="w-full sm:w-[140px] h-12 rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movement Log List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(log.type)}`}>
                {getTypeIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{log.itemName}</h4>
                    <Badge variant="outline" className="rounded-lg text-xs">{log.category}</Badge>
                  </div>
                  <Badge className={`${getTypeColor(log.type)} rounded-lg`}>
                    {getTypeLabel(log.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground mb-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{log.quantity} {log.unit}</span>
                </div>
                {(log.fromLocation || log.toLocation) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    {log.fromLocation && <span>{log.fromLocation}</span>}
                    {log.fromLocation && log.toLocation && <ArrowRight className="w-4 h-4" />}
                    {log.toLocation && <span>{log.toLocation}</span>}
                  </div>
                )}
                {log.reason && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Reason:</span> {log.reason}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {log.performedBy}</span>
                  <span>{formatTime(log.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No movement logs found</p>
        </div>
      )}
    </div>
  );
};

export default UsageLogTab;
