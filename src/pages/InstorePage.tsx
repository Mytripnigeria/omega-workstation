import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Eye,
  Wrench,
  History,
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
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import ItemDetailsModal from "@/components/ItemDetailsModal";
import GadgetManagement from "@/components/GadgetManagement";
import UsageLogTab from "@/components/UsageLogTab";
import { useCategories } from "@/hooks/useCategories";
import CategoryLoadError from "@/components/CategoryLoadError";

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
  const navigate = useNavigate();
  const {
    data: inventoryCategories = [],
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories("inventory");
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
  
  const [newItems, setNewItems] = useState<NewItem[]>([{ ...emptyNewItem }]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<InventoryItem | null>(null);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Package className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Instore Inventory</h1>
                <p className="text-sm text-muted-foreground">{filteredItems.length} items in stock</p>
              </div>
            </div>
          </div>
          <ActivityLogButton onClick={() => setShowActivityLog(true)} />
        </div>
      </div>

      <div className="page-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl flex-wrap">
            <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-card">Inventory</TabsTrigger>
            <TabsTrigger value="gadgets" className="rounded-lg data-[state=active]:bg-card">
              <Wrench className="w-4 h-4 mr-1" />
              Gadgets
            </TabsTrigger>
            <TabsTrigger value="usage" className="rounded-lg data-[state=active]:bg-card">
              <History className="w-4 h-4 mr-1" />
              Usage Log
            </TabsTrigger>
            <TabsTrigger value="returns" className="rounded-lg data-[state=active]:bg-card">
              Pending Returns
              {pendingReturns.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">{pendingReturns.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-border"
                />
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl">
                  <Filter className="w-4 h-4 mr-2 text-foreground" />
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
            <div className="flex flex-wrap gap-3 mb-6">
              <Button onClick={() => setShowAddModal(true)} className="rounded-xl h-11">
                <Plus className="w-4 h-4 mr-2 text-foreground" />
                Add Items
              </Button>
              <Button
                variant="outline"
                disabled={selectedItems.length === 0}
                onClick={() => setShowMoveModal(true)}
                className="rounded-xl h-11"
              >
                <ArrowRight className="w-4 h-4 mr-2 text-foreground" />
                Move to Outstore
              </Button>
              <Button
                variant="outline"
                disabled={selectedItems.length === 0}
                onClick={() => setShowWasteModal(true)}
                className="rounded-xl h-11"
              >
                <Trash2 className="w-4 h-4 mr-2 text-foreground" />
                Report Waste
              </Button>
            </div>

            {/* Inventory Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                          onChange={(e) =>
                            setSelectedItems(e.target.checked ? filteredItems.map((i) => i.id) : [])
                          }
                          className="rounded border-border w-5 h-5"
                        />
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Item</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded border-border w-5 h-5"
                          />
                        </td>
                        <td className="p-4 font-medium text-foreground">{item.name}</td>
                        <td className="p-4 text-muted-foreground">{item.category}</td>
                        <td className="p-4 text-foreground font-medium">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="flex items-center gap-1.5 w-fit rounded-lg">
                            <MapPin className="w-3 h-3 text-foreground" />
                            {getLocationName(item.location)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {isLowStock(item) ? (
                            <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1.5 w-fit rounded-lg">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 rounded-lg">OK</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItemForDetails(item)}
                            className="rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <div className="space-y-4">
              {pendingReturns.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <RotateCcw className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending return requests</p>
                </div>
              ) : (
                pendingReturns.map((returnReq) => (
                  <div key={returnReq.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="rounded-lg">{getLocationName(returnReq.fromLocation)}</Badge>
                          <ArrowRight className="w-4 h-4 text-foreground" />
                          <Badge variant="secondary" className="rounded-lg">{getLocationName(returnReq.toLocation)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested by {returnReq.requestedBy} • {Math.floor((Date.now() - returnReq.requestedAt.getTime()) / 60000)} min ago
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRejectReturn(returnReq.id)} className="rounded-lg">
                          <X className="w-4 h-4 text-foreground" />
                        </Button>
                        <Button size="sm" onClick={() => handleApproveReturn(returnReq.id)} className="rounded-lg">
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                      {returnReq.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} {item.name}
                        </p>
                      ))}
                      <p className="text-sm text-muted-foreground mt-3">
                        <span className="font-medium">Reason:</span> {returnReq.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="gadgets" className="mt-6">
            <GadgetManagement />
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <UsageLogTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Activity Log */}
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Instore Inventory"
      />

      {/* Item Details Modal */}
      <ItemDetailsModal
        open={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        item={selectedItemForDetails ? {
          ...selectedItemForDetails,
          locationName: getLocationName(selectedItemForDetails.location)
        } : null}
      />

      {/* Add Items Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Inventory Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newItems.map((item, index) => (
              <div key={index} className="bg-secondary/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Item {index + 1}</span>
                  {newItems.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(index)} className="rounded-lg">
                      <X className="w-4 h-4 text-foreground" />
                    </Button>
                  )}
                </div>
                <Input 
                  placeholder="Item name *" 
                  value={item.name}
                  onChange={(e) => updateNewItem(index, "name", e.target.value)}
                  className="rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  {categoriesError ? (
                    <CategoryLoadError compact onRetry={() => refetchCategories()} />
                  ) : (
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateNewItem(index, "category", v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryCategories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.emoji ? `${c.emoji} ${c.name}` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Select value={item.supplier} onValueChange={(v) => updateNewItem(index, "supplier", v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Supplier" />
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
                <div className="grid grid-cols-3 gap-3">
                  <Input 
                    placeholder="Quantity *" 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateNewItem(index, "quantity", e.target.value)}
                    className="rounded-xl"
                  />
                  <Input 
                    placeholder="Unit *"
                    value={item.unit}
                    onChange={(e) => updateNewItem(index, "unit", e.target.value)}
                    className="rounded-xl"
                  />
                  <Input 
                    placeholder="Min Stock"
                    type="number"
                    value={item.minStock}
                    onChange={(e) => updateNewItem(index, "minStock", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Select value={item.location} onValueChange={(v) => updateNewItem(index, "location", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Storage location *" />
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
            <Button variant="outline" onClick={handleAddItem} className="w-full rounded-xl">
              <Plus className="w-4 h-4 mr-2 text-foreground" />
              Add Another Item
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveItems} className="rounded-xl">
              Save Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Items Modal */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Outstore</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Moving {selectedItems.length} item(s) to outstore
            </p>
            <Select value={moveDestination} onValueChange={setMoveDestination}>
              <SelectTrigger className="rounded-xl">
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
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMoveModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleMoveItems} className="rounded-xl">
              Move Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waste Report Modal */}
      <Dialog open={showWasteModal} onOpenChange={setShowWasteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Waste</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Reporting {selectedItems.length} item(s) as waste
            </p>
            <Select value={wasteReason} onValueChange={setWasteReason}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Reason for waste *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="spoiled">Spoiled</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="contaminated">Contaminated</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Additional notes..."
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowWasteModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleReportWaste} variant="destructive" className="rounded-xl">
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
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
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
