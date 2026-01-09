import { useState } from "react";
import {
  Package,
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Filter,
  MapPin,
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

interface StoreLocation {
  id: string;
  name: string;
  type: "instore" | "outstore";
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

const InstorePage = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: () => void }>({
    open: false,
    action: () => {},
  });

  const instoreLocations = locations.filter((l) => l.type === "instore");

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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Instore Inventory"
        icon={Package}
        iconColor="text-category-sage"
        badge={`${filteredItems.length} Items`}
      />

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

      {/* Add Items Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Items (Batch)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Add multiple items at once by filling the form below.
            </p>
            <Input placeholder="Item name" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Quantity" type="number" />
              <Input placeholder="Unit (kg, L, pcs)" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {instoreLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>
          </div>
          <Button className="w-full gradient-primary" onClick={() => setShowAddModal(false)}>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter((l) => l.type === "outstore")
                  .map((loc) => (
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
            <Button
              className="flex-1 gradient-primary"
              onClick={() => {
                setShowMoveModal(false);
                setSelectedItems([]);
              }}
            >
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
            <Select>
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
            <Input placeholder="Additional notes (optional)" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowWasteModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setShowWasteModal(false);
                setSelectedItems([]);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Report Waste
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...confirmDialog} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title="Confirm Action" description="Are you sure you want to proceed?" onConfirm={confirmDialog.action} />
    </div>
  );
};

export default InstorePage;
