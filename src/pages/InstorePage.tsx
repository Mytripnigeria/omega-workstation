import { useState } from "react";
import {
  Package,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Filter,
  MapPin,
  Check,
  X,
  RotateCcw,
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
  expiryDate?: string;
}

interface PendingReturn {
  id: string;
  items: { name: string; quantity: number; unit: string }[];
  fromLocation: string;
  toLocation: string;
  reason: string;
  requestedAt: Date;
  requestedBy: string;
}

interface StoreLocation {
  id: string;
  name: string;
  type: "instore" | "outstore";
}

interface Supplier {
  id: string;
  name: string;
}

const suppliers: Supplier[] = [
  { id: "sup1", name: "Fresh Foods Ltd" },
  { id: "sup2", name: "Metro Wholesale" },
  { id: "sup3", name: "Agro Direct" },
  { id: "sup4", name: "Protein Masters" },
  { id: "sup5", name: "Beverage Hub" },
];

interface NewItem {
  name: string;
  category: string;
  quantity: string;
  supplier: string;
  unit: string;
  minStock: string;
  location: string;
}

const locations: StoreLocation[] = [
  { id: "sr1", name: "Store Room 1", type: "instore" },
  { id: "sr2", name: "Store Room 2", type: "instore" },
  { id: "freezer", name: "Main Freezer", type: "instore" },
  { id: "kc", name: "Kitchen Chiller", type: "outstore" },
  { id: "prep", name: "Prep Station", type: "outstore" },
];

const mockItems: InventoryItem[] = [
  { id: "1", name: "Tomatoes", category: "Produce", quantity: 50, unit: "kg", minStock: 20, location: "sr1" },
  { id: "2", name: "Chicken Breast", category: "Meat", quantity: 30, unit: "kg", minStock: 15, location: "freezer" },
  { id: "3", name: "Rice", category: "Grains", quantity: 100, unit: "kg", minStock: 40, location: "sr2" },
  { id: "4", name: "Cooking Oil", category: "Oil", quantity: 25, unit: "L", minStock: 10, location: "sr1" },
  { id: "5", name: "Onions", category: "Produce", quantity: 35, unit: "kg", minStock: 15, location: "sr1" },
  { id: "6", name: "Pepper", category: "Spices", quantity: 8, unit: "kg", minStock: 5, location: "sr2" },
  { id: "7", name: "Fish Fillet", category: "Seafood", quantity: 20, unit: "kg", minStock: 10, location: "freezer" },
  { id: "8", name: "Plantain", category: "Produce", quantity: 45, unit: "bunches", minStock: 20, location: "sr1" },
];

const mockPendingReturns: PendingReturn[] = [
  { id: "r1", items: [{ name: "Diced Tomatoes", quantity: 5, unit: "kg" }], fromLocation: "prep", toLocation: "sr1", reason: "Excess preparation", requestedAt: new Date(Date.now() - 30 * 60000), requestedBy: "John A." },
  { id: "r2", items: [{ name: "Marinated Chicken", quantity: 3, unit: "kg" }], fromLocation: "kc", toLocation: "freezer", reason: "Not used today", requestedAt: new Date(Date.now() - 60 * 60000), requestedBy: "Sarah O." },
];

const emptyNewItem: NewItem = { name: "", category: "", quantity: "", unit: "", minStock: "", location: "", supplier: "" };

const InstorePage = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [pendingReturns, setPendingReturns] = useState<PendingReturn[]>(mockPendingReturns);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [moveDestination, setMoveDestination] = useState("");
  const [wasteReason, setWasteReason] = useState("");
  const [wasteNotes, setWasteNotes] = useState("");
  
  // Batch add items
  const [newItems, setNewItems] = useState<NewItem[]>([{ ...emptyNewItem }]);

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {},
  });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });

  const instoreLocations = locations.filter((l) => l.type === "instore");
  const outstoreLocations = locations.filter((l) => l.type === "outstore");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    const isInstore = instoreLocations.some((l) => l.id === item.location);
    return matchesSearch && matchesLocation && isInstore;
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

  const handleAddItem = () => {
    setNewItems([...newItems, { ...emptyNewItem }]);
  };

  const handleRemoveItem = (index: number) => {
    if (newItems.length > 1) {
      setNewItems(newItems.filter((_, i) => i !== index));
    }
  };

  const updateNewItem = (index: number, field: keyof NewItem, value: string) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  const handleSaveItems = () => {
    const validItems = newItems.filter(item => item.name && item.quantity && item.unit && item.location);
    if (validItems.length === 0) {
      setToast({ open: true, type: "error", title: "Error", message: "Please fill in all required fields" });
      return;
    }
    
    const newInventoryItems: InventoryItem[] = validItems.map((item, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      name: item.name,
      category: item.category || "Uncategorized",
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      minStock: parseFloat(item.minStock) || 0,
      location: item.location,
    }));
    
    setItems([...items, ...newInventoryItems]);
    setNewItems([{ ...emptyNewItem }]);
    setShowAddModal(false);
    setToast({ open: true, type: "success", title: "Items Added", message: `${validItems.length} item(s) added successfully` });
  };

  const handleMoveItems = () => {
    if (!moveDestination) {
      setToast({ open: true, type: "error", title: "Error", message: "Please select a destination" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Move Items",
      description: `Move ${selectedItems.length} item(s) to ${getLocationName(moveDestination)}?`,
      action: () => {
        setItems(items.map(item => 
          selectedItems.includes(item.id) ? { ...item, location: moveDestination } : item
        ));
        setSelectedItems([]);
        setMoveDestination("");
        setShowMoveModal(false);
        setToast({ open: true, type: "success", title: "Items Moved", message: "Items have been moved to outstore" });
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

  const handleApproveReturn = (returnId: string) => {
    setConfirmDialog({
      open: true,
      title: "Approve Return",
      description: "Approve this return request and move items back to instore?",
      action: () => {
        setPendingReturns(prev => prev.filter(r => r.id !== returnId));
        setToast({ open: true, type: "success", title: "Return Approved", message: "Items have been returned to instore" });
      }
    });
  };

  const handleRejectReturn = (returnId: string) => {
    setConfirmDialog({
      open: true,
      title: "Reject Return",
      description: "Reject this return request?",
      action: () => {
        setPendingReturns(prev => prev.filter(r => r.id !== returnId));
        setToast({ open: true, type: "info", title: "Return Rejected", message: "Return request has been rejected" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Instore Inventory"
        icon={Package}
        iconColor="text-category-sage"
        badge={`${filteredItems.length} Items`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="returns">
            Pending Returns
            {pendingReturns.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingReturns.length}</Badge>
            )}
          </TabsTrigger>
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
                {instoreLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={() => setShowAddModal(true)} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Items
            </Button>
            <Button
              variant="outline"
              disabled={selectedItems.length === 0}
              onClick={() => setShowMoveModal(true)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Move to Outstore
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

        <TabsContent value="returns" className="mt-4">
          <div className="space-y-4">
            {pendingReturns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending return requests</p>
              </div>
            ) : (
              pendingReturns.map((returnReq) => (
                <div key={returnReq.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{getLocationName(returnReq.fromLocation)}</Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="secondary">{getLocationName(returnReq.toLocation)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested by {returnReq.requestedBy} • {Math.floor((Date.now() - returnReq.requestedAt.getTime()) / 60000)} min ago
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRejectReturn(returnReq.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="gradient-primary" onClick={() => handleApproveReturn(returnReq.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                    {returnReq.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} {item.name}
                      </p>
                    ))}
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Reason:</span> {returnReq.reason}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Items Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Items (Batch)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newItems.map((item, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Item {index + 1}</span>
                  {newItems.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input 
                  placeholder="Item name *" 
                  value={item.name}
                  onChange={(e) => updateNewItem(index, "name", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Category" 
                    value={item.category}
                    onChange={(e) => updateNewItem(index, "category", e.target.value)}
                  />
                  <Input 
                    placeholder="Min Stock" 
                    type="number"
                    value={item.minStock}
                    onChange={(e) => updateNewItem(index, "minStock", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Quantity *" 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateNewItem(index, "quantity", e.target.value)}
                  />
                  <Input 
                    placeholder="Unit (kg, L, pcs) *"
                    value={item.unit}
                    onChange={(e) => updateNewItem(index, "unit", e.target.value)}
                  />
                </div>
                <Select value={item.location} onValueChange={(v) => updateNewItem(index, "location", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location *" />
                  </SelectTrigger>
                  <SelectContent>
                    {instoreLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={item.supplier} onValueChange={(v) => updateNewItem(index, "supplier", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>
          </div>
          <Button className="w-full gradient-primary" onClick={handleSaveItems}>
            Save All Items
          </Button>
        </DialogContent>
      </Dialog>

      {/* Move Modal */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Items to Outstore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Moving {selectedItems.length} item(s) to outstore location.
            </p>
            <Select value={moveDestination} onValueChange={setMoveDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {outstoreLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 gradient-primary" onClick={handleMoveItems}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Move Items
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

export default InstorePage;