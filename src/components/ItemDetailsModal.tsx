import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Calendar, TrendingUp, TrendingDown, Clock, User, ArrowRight, ArrowLeft } from "lucide-react";

interface ItemHistory {
  id: string;
  action: "received" | "moved_out" | "moved_in" | "used" | "wasted" | "returned";
  quantity: number;
  date: Date;
  performedBy: string;
  notes?: string;
  fromLocation?: string;
  toLocation?: string;
}

interface BatchInfo {
  batchNumber: string;
  receivedDate: Date;
  expiryDate?: Date;
  supplier: string;
  initialQuantity: number;
  currentQuantity: number;
  cost: number;
}

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

const mockHistory: ItemHistory[] = [
  { id: "h1", action: "received", quantity: 50, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), performedBy: "John D.", notes: "Initial stock from Fresh Foods Ltd" },
  { id: "h2", action: "moved_out", quantity: 10, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), performedBy: "Sarah O.", fromLocation: "Store Room 1", toLocation: "Prep Station" },
  { id: "h3", action: "used", quantity: 5, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), performedBy: "Mike B.", notes: "Used for Jollof Rice prep" },
  { id: "h4", action: "moved_in", quantity: 3, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), performedBy: "Sarah O.", fromLocation: "Prep Station", toLocation: "Store Room 1", notes: "Returned excess" },
  { id: "h5", action: "wasted", quantity: 2, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), performedBy: "Ada E.", notes: "Spoiled" },
];

const mockBatches: BatchInfo[] = [
  { batchNumber: "BTH-2024-001", receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), supplier: "Fresh Foods Ltd", initialQuantity: 50, currentQuantity: 36, cost: 25000 },
  { batchNumber: "BTH-2024-002", receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), supplier: "Metro Wholesale", initialQuantity: 30, currentQuantity: 14, cost: 18000 },
];

const ItemDetailsModal = ({ open, onClose, item }: ItemDetailsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!item) return null;

  const getActionIcon = (action: ItemHistory["action"]) => {
    switch (action) {
      case "received": return <TrendingUp className="w-4 h-4 text-status-success" />;
      case "moved_out": return <ArrowRight className="w-4 h-4 text-status-info" />;
      case "moved_in": return <ArrowLeft className="w-4 h-4 text-status-info" />;
      case "used": return <TrendingDown className="w-4 h-4 text-status-warning" />;
      case "wasted": return <TrendingDown className="w-4 h-4 text-destructive" />;
      case "returned": return <ArrowLeft className="w-4 h-4 text-status-success" />;
    }
  };

  const getActionLabel = (action: ItemHistory["action"]) => {
    switch (action) {
      case "received": return "Received";
      case "moved_out": return "Moved Out";
      case "moved_in": return "Moved In";
      case "used": return "Used";
      case "wasted": return "Wasted";
      case "returned": return "Returned";
    }
  };

  const getActionColor = (action: ItemHistory["action"]) => {
    switch (action) {
      case "received": return "bg-status-success/10 text-status-success";
      case "moved_out": return "bg-status-info/10 text-status-info";
      case "moved_in": return "bg-status-info/10 text-status-info";
      case "used": return "bg-status-warning/10 text-status-warning";
      case "wasted": return "bg-destructive/10 text-destructive";
      case "returned": return "bg-status-success/10 text-status-success";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getDaysUntilExpiry = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return days;
  };

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
              <p className="text-sm font-normal text-muted-foreground">{item.category}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card">Overview</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-card">Movement History</TabsTrigger>
            <TabsTrigger value="batches" className="rounded-lg data-[state=active]:bg-card">Batches</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Current Status */}
              <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-foreground">Current Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-semibold text-foreground">{item.quantity} {item.unit}</p>
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

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-status-success/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-status-success">+50</p>
                  <p className="text-xs text-muted-foreground">Received (30d)</p>
                </div>
                <div className="bg-status-warning/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-status-warning">-12</p>
                  <p className="text-xs text-muted-foreground">Used (30d)</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">-2</p>
                  <p className="text-xs text-muted-foreground">Wasted (30d)</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Recent Activity</h4>
                {mockHistory.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl">
                    {getActionIcon(entry.action)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {getActionLabel(entry.action)} {entry.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.performedBy} • {formatDate(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-3">
              {mockHistory.map((entry) => (
                <div key={entry.id} className="bg-secondary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`${getActionColor(entry.action)} rounded-lg`}>
                          {getActionLabel(entry.action)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.date)} at {formatTime(entry.date)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.quantity} {item.unit}
                      </p>
                      {entry.fromLocation && entry.toLocation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.fromLocation} → {entry.toLocation}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {entry.performedBy}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="batches" className="mt-0 space-y-3">
              {mockBatches.map((batch) => {
                const daysUntilExpiry = batch.expiryDate ? getDaysUntilExpiry(batch.expiryDate) : null;
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7;
                
                return (
                  <div key={batch.batchNumber} className="bg-secondary/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-lg font-mono">{batch.batchNumber}</Badge>
                        {isExpiringSoon && (
                          <Badge className="bg-status-warning text-foreground rounded-lg text-xs">
                            {daysUntilExpiry}d until expiry
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {batch.currentQuantity}/{batch.initialQuantity} {item.unit}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Received</p>
                          <p className="text-foreground">{formatDate(batch.receivedDate)}</p>
                        </div>
                      </div>
                      {batch.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className={isExpiringSoon ? "text-status-warning font-medium" : "text-foreground"}>
                              {formatDate(batch.expiryDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Supplier: {batch.supplier}</span>
                      <span className="text-xs text-foreground font-medium">Cost: ₦{batch.cost.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
