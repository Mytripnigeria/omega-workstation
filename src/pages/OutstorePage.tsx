import { useState } from "react";
import {
  Package,
  Search,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Filter,
  MapPin,
  RotateCcw,
  Plus,
  X,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  location: string;
}

interface UsageLog {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  usedFor: string;
  usedAt: Date;
  usedBy: string;
}

interface StoreLocation {
  id: string;
  name: string;
  type: "instore" | "outstore";
}

interface RequestItem {
  name: string;
  quantity: string;
  unit: string;
  fromLocation: string;
}

const locations: StoreLocation[] = [
  { id: "sr1", name: "Store Room 1", type: "instore" },
  { id: "sr2", name: "Store Room 2", type: "instore" },
  { id: "freezer", name: "Main Freezer", type: "instore" },
  { id: "kc", name: "Kitchen Chiller", type: "outstore" },
  { id: "prep", name: "Prep Station", type: "outstore" },
];

const mockItems: InventoryItem[] = [
  { id: "1", name: "Diced Tomatoes", category: "Produce", quantity: 10, unit: "kg", minStock: 5, location: "prep" },
  { id: "2", name: "Marinated Chicken", category: "Meat", quantity: 8, unit: "kg", minStock: 4, location: "kc" },
  { id: "3", name: "Sliced Onions", category: "Produce", quantity: 5, unit: "kg", minStock: 3, location: "prep" },
  { id: "4", name: "Prepped Rice", category: "Grains", quantity: 15, unit: "kg", minStock: 10, location: "prep" },
];

const mockUsageLogs: UsageLog[] = [
  { id: "u1", itemName: "Diced Tomatoes", quantity: 2, unit: "kg", usedFor: "Jollof Rice prep", usedAt: new Date(Date.now() - 30 * 60000), usedBy: "John A." },
  { id: "u2", itemName: "Marinated Chicken", quantity: 4, unit: "kg", usedFor: "Grilled Chicken orders", usedAt: new Date(Date.now() - 60 * 60000), usedBy: "Sarah O." },
  { id: "u3", itemName: "Sliced Onions", quantity: 1, unit: "kg", usedFor: "Fried Rice prep", usedAt: new Date(Date.now() - 90 * 60000), usedBy: "Mike B." },
];

const emptyRequestItem: RequestItem = { name: "", quantity: "", unit: "", fromLocation: "" };

const OutstorePage = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [usageLogs] = useState<UsageLog[]>(mockUsageLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLogUsageModal, setShowLogUsageModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [returnDestination, setReturnDestination] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [wasteReason, setWasteReason] = useState("");
  const [wasteNotes, setWasteNotes] = useState("");
  const [usageFor, setUsageFor] = useState("");
  
  // Request items from instore
  const [requestItems, setRequestItems] = useState<RequestItem[]>([{ ...emptyRequestItem }]);

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {},
  });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });

  const outstoreLocations = locations.filter((l) => l.type === "outstore");
  const instoreLocations = locations.filter((l) => l.type === "instore");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    const isOutstore = outstoreLocations.some((l) => l.id === item.location);
    return matchesSearch && matchesLocation && isOutstore;
  });

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getLocationName = (locationId: string) => {
    return locations.find((l) => l.id === locationId)?.name || locationId;
  };

  const isLowStock = (item: InventoryItem) => item.quantity <= item.minStock;

  const handleAddRequestItem = () => {
    setRequestItems([...requestItems, { ...emptyRequestItem }]);
  };

  const handleRemoveRequestItem = (index: number) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter((_, i) => i !== index));
    }
  };

  const updateRequestItem = (index: number, field: keyof RequestItem, value: string) => {
    const updated = [...requestItems];
    updated[index] = { ...updated[index], [field]: value };
    setRequestItems(updated);
  };

  const handleSubmitRequest = () => {
    const validItems = requestItems.filter(item => item.name && item.quantity && item.fromLocation);
    if (validItems.length === 0) {
      setToast({ open: true, type: "error", title: "Error", message: "Please fill in all required fields" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Request Items",
      description: `Request ${validItems.length} item(s) from instore?`,
      action: () => {
        setRequestItems([{ ...emptyRequestItem }]);
        setShowRequestModal(false);
        setToast({ open: true, type: "success", title: "Request Sent", message: "Your request has been sent to instore for approval" });
      }
    });
  };

  const handleReturnItems = () => {
    if (!returnDestination) {
      setToast({ open: true, type: "error", title: "Error", message: "Please select a destination" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Return Items",
      description: `Return ${selectedItems.length} item(s) to ${getLocationName(returnDestination)}?`,
      action: () => {
        setSelectedItems([]);
        setReturnDestination("");
        setReturnReason("");
        setShowReturnModal(false);
        setToast({ open: true, type: "success", title: "Return Requested", message: "Return request sent to instore for approval" });
      }
    });
  };

  const handleReportWaste = () => {
    if (!wasteReason) {
      setToast({ open: true, type: "error", title: "Error", message: "Please select a reason" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Report Waste",
      description: `Report ${selectedItems.length} item(s) as ${wasteReason}?`,
      action: () => {
        setItems(items.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        setWasteReason("");
        setWasteNotes("");
        setShowWasteModal(false);
        setToast({ open: true, type: "success", title: "Waste Reported", message: "Items have been removed from inventory" });
      }
    });
  };

  const handleLogUsage = () => {
    if (selectedItems.length === 0 || !usageFor) {
      setToast({ open: true, type: "error", title: "Error", message: "Please select items and enter usage details" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Log Usage",
      description: `Log usage for ${selectedItems.length} item(s)?`,
      action: () => {
        setSelectedItems([]);
        setUsageFor("");
        setShowLogUsageModal(false);
        setToast({ open: true, type: "success", title: "Usage Logged", message: "Item usage has been recorded" });
      }
    });
  };

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Outstore Inventory"
        icon={Package}
        iconColor="text-category-coral"
        badge={`${filteredItems.length} Items`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="usage">Usage Log</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {outstoreLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={() => setShowRequestModal(true)} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Request from Instore
            </Button>
            <Button
              variant="outline"
              disabled={selectedItems.length === 0}
              onClick={() => setShowReturnModal(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Return to Instore
            </Button>
            <Button
              variant="outline"
              disabled={selectedItems.length === 0}
              onClick={() => setShowLogUsageModal(true)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Log Usage
            </Button>
            <Button
              variant="outline"
              disabled={selectedItems.length === 0}
              onClick={() => setShowWasteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Report Waste
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onChange={(e) =>
                          setSelectedItems(e.target.checked ? filteredItems.map((i) => i.id) : [])
                        }
                        className="rounded border-border"
                      />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Item</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-t border-border hover:bg-secondary/20">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-3 font-medium text-foreground">{item.name}</td>
                      <td className="p-3 text-muted-foreground">{item.category}</td>
                      <td className="p-3 text-foreground">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <MapPin className="w-3 h-3" />
                          {getLocationName(item.location)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {isLowStock(item) ? (
                          <Badge className="bg-status-warning text-foreground flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-status-success text-white">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <div className="space-y-3">
            {usageLogs.map((log) => (
              <div key={log.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{log.itemName}</span>
                  <span className="text-sm text-muted-foreground">{formatTime(log.usedAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{log.quantity} {log.unit}</span>
                  <span>•</span>
                  <span>{log.usedFor}</span>
                  <span>•</span>
                  <span>by {log.usedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Items Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Items from Instore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {requestItems.map((item, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Item {index + 1}</span>
                  {requestItems.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveRequestItem(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input 
                  placeholder="Item name *" 
                  value={item.name}
                  onChange={(e) => updateRequestItem(index, "name", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Quantity *" 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateRequestItem(index, "quantity", e.target.value)}
                  />
                  <Input 
                    placeholder="Unit (kg, L, pcs) *"
                    value={item.unit}
                    onChange={(e) => updateRequestItem(index, "unit", e.target.value)}
                  />
                </div>
                <Select value={item.fromLocation} onValueChange={(v) => updateRequestItem(index, "fromLocation", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="From location *" />
                  </SelectTrigger>
                  <SelectContent>
                    {instoreLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddRequestItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>
          </div>
          <Button className="w-full gradient-primary" onClick={handleSubmitRequest}>
            Submit Request
          </Button>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Items to Instore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Returning {selectedItems.length} item(s) to instore location.
            </p>
            <Select value={returnDestination} onValueChange={setReturnDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {instoreLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Reason for return *"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowReturnModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 gradient-primary" onClick={handleReturnItems}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Submit Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Usage Modal */}
      <Dialog open={showLogUsageModal} onOpenChange={setShowLogUsageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Item Usage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Logging usage for {selectedItems.length} item(s).
            </p>
            <Input 
              placeholder="Used for (e.g., Jollof Rice prep) *"
              value={usageFor}
              onChange={(e) => setUsageFor(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowLogUsageModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 gradient-primary" onClick={handleLogUsage}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Log Usage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waste Report Modal */}
      <Dialog open={showWasteModal} onOpenChange={setShowWasteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Waste/Damage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Reporting waste for {selectedItems.length} item(s).
            </p>
            <Select value={wasteReason} onValueChange={setWasteReason}>
              <SelectTrigger>
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="spoiled">Spoiled</SelectItem>
                <SelectItem value="contaminated">Contaminated</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Additional notes (optional)"
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowWasteModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleReportWaste}>
              <Trash2 className="w-4 h-4 mr-2" />
              Report Waste
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} 
        title={confirmDialog.title} 
        description={confirmDialog.description} 
        onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} 
      />
      <ToastNotification 
        open={toast.open} 
        onClose={() => setToast({ ...toast, open: false })} 
        type={toast.type} 
        title={toast.title} 
        message={toast.message} 
      />
    </div>
  );
};

export default OutstorePage;