import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  RefreshCw,
  Settings,
  Zap,
  Thermometer,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useCategories } from "@/hooks/useCategories";

interface Gadget {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  location: string;
  condition: "excellent" | "good" | "fair" | "needs_repair" | "out_of_service";
  lastMaintenance: Date;
  nextMaintenance?: Date;
  purchaseDate: Date;
  notes?: string;
}

interface MaintenanceLog {
  id: string;
  gadgetId: string;
  type: "routine" | "repair" | "replacement" | "inspection";
  date: Date;
  performedBy: string;
  notes: string;
  cost?: number;
}

const mockGadgets: Gadget[] = [
  { id: "g1", name: "Main Refrigerator", category: "Refrigeration", serialNumber: "REF-2024-001", location: "Kitchen", condition: "good", lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2023, 5, 15) },
  { id: "g2", name: "Deep Fryer", category: "Cooking", serialNumber: "FRY-2024-002", location: "Kitchen", condition: "excellent", lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2024, 1, 10) },
  { id: "g3", name: "Chest Freezer", category: "Refrigeration", serialNumber: "FRZ-2023-001", location: "Store Room 1", condition: "needs_repair", lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2022, 8, 20), notes: "Compressor making noise" },
  { id: "g4", name: "Industrial Blender", category: "Processing", serialNumber: "BLD-2024-003", location: "Prep Station", condition: "fair", lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2024, 0, 5) },
  { id: "g5", name: "Gas Cooker (6 Burner)", category: "Cooking", serialNumber: "GAS-2023-002", location: "Kitchen", condition: "good", lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), nextMaintenance: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2023, 3, 1) },
  { id: "g6", name: "POS Terminal", category: "Electronics", serialNumber: "POS-2024-001", location: "Counter", condition: "excellent", lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), purchaseDate: new Date(2024, 2, 15) },
];

const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: "m1", gadgetId: "g1", type: "routine", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), performedBy: "Tech Services Ltd", notes: "Cleaned coils, checked temperature", cost: 15000 },
  { id: "m2", gadgetId: "g3", type: "repair", date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), performedBy: "Frost Tech", notes: "Replaced thermostat", cost: 45000 },
  { id: "m3", gadgetId: "g5", type: "inspection", date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), performedBy: "Gas Safety Co", notes: "Annual gas safety check - passed", cost: 8000 },
];

const GadgetManagement = () => {
  const { data: equipmentCategories = [] } = useCategories("equipment");
  const [gadgets, setGadgets] = useState<Gadget[]>(mockGadgets);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {},
  });

  // Form states
  const [newCondition, setNewCondition] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenancePerformedBy, setMaintenancePerformedBy] = useState("");

  const filteredGadgets = gadgets.filter((gadget) => {
    const matchesSearch = gadget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gadget.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = filterCondition === "all" || gadget.condition === filterCondition;
    return matchesSearch && matchesCondition;
  });

  const getConditionColor = (condition: Gadget["condition"]) => {
    switch (condition) {
      case "excellent": return "bg-status-success text-white";
      case "good": return "bg-status-info text-white";
      case "fair": return "bg-status-warning text-foreground";
      case "needs_repair": return "bg-destructive/80 text-white";
      case "out_of_service": return "bg-muted text-muted-foreground";
    }
  };

  const getConditionLabel = (condition: Gadget["condition"]) => {
    switch (condition) {
      case "excellent": return "Excellent";
      case "good": return "Good";
      case "fair": return "Fair";
      case "needs_repair": return "Needs Repair";
      case "out_of_service": return "Out of Service";
    }
  };

  const getCategoryIcon = (category: string) => {
    const match = equipmentCategories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase(),
    );
    if (match?.emoji) {
      return <span className="text-base leading-none">{match.emoji}</span>;
    }
    // Static fallbacks for legacy gadgets whose categories haven't synced yet.
    switch (category) {
      case "Refrigeration":
        return <Thermometer className="w-4 h-4" />;
      case "Cooking":
        return <Zap className="w-4 h-4" />;
      case "Processing":
        return <Settings className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleUpdateCondition = () => {
    if (!selectedGadget || !newCondition) return;
    setConfirmDialog({
      open: true,
      title: "Update Condition",
      description: `Update ${selectedGadget.name} condition to "${getConditionLabel(newCondition as Gadget["condition"])}"?`,
      action: () => {
        setGadgets(prev => prev.map(g => 
          g.id === selectedGadget.id 
            ? { ...g, condition: newCondition as Gadget["condition"], notes: conditionNotes || g.notes } 
            : g
        ));
        setShowUpdateModal(false);
        setNewCondition("");
        setConditionNotes("");
        setSelectedGadget(null);
      }
    });
  };

  const handleLogMaintenance = () => {
    if (!selectedGadget || !maintenanceType || !maintenanceNotes) return;
    setConfirmDialog({
      open: true,
      title: "Log Maintenance",
      description: `Log ${maintenanceType} maintenance for ${selectedGadget.name}?`,
      action: () => {
        setGadgets(prev => prev.map(g => 
          g.id === selectedGadget.id 
            ? { ...g, lastMaintenance: new Date() } 
            : g
        ));
        setShowMaintenanceModal(false);
        setMaintenanceType("");
        setMaintenanceNotes("");
        setMaintenanceCost("");
        setMaintenancePerformedBy("");
        setSelectedGadget(null);
      }
    });
  };

  const needsAttentionCount = gadgets.filter(g => g.condition === "needs_repair" || g.condition === "out_of_service").length;
  const maintenanceDueCount = gadgets.filter(g => g.nextMaintenance && g.nextMaintenance.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-foreground">{gadgets.length}</p>
          <p className="text-sm text-muted-foreground">Total Items</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-status-success">{gadgets.filter(g => g.condition === "excellent" || g.condition === "good").length}</p>
          <p className="text-sm text-muted-foreground">Working Well</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-destructive">{needsAttentionCount}</p>
          <p className="text-sm text-muted-foreground">Needs Attention</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-status-warning">{maintenanceDueCount}</p>
          <p className="text-sm text-muted-foreground">Maintenance Due</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search gadgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-border"
          />
        </div>
        <Select value={filterCondition} onValueChange={setFilterCondition}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl">
            <SelectValue placeholder="Filter by condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="needs_repair">Needs Repair</SelectItem>
            <SelectItem value="out_of_service">Out of Service</SelectItem>
          </SelectContent>
        </Select>
        <Button className="rounded-xl h-12" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gadget
        </Button>
      </div>

      {/* Gadgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGadgets.map((gadget) => (
          <div key={gadget.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  {getCategoryIcon(gadget.category)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{gadget.name}</h4>
                  <p className="text-xs text-muted-foreground">{gadget.serialNumber}</p>
                </div>
              </div>
              <Badge className={`${getConditionColor(gadget.condition)} rounded-lg text-xs`}>
                {getConditionLabel(gadget.condition)}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>{gadget.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last maintenance: {formatDate(gadget.lastMaintenance)}</span>
              </div>
              {gadget.notes && (
                <div className="flex items-start gap-2 text-sm text-status-warning bg-status-warning/10 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{gadget.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => {
                  setSelectedGadget(gadget);
                  setShowUpdateModal(true);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => {
                  setSelectedGadget(gadget);
                  setShowMaintenanceModal(true);
                }}
              >
                <Wrench className="w-4 h-4 mr-1" />
                Maintain
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Condition Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Condition</DialogTitle>
          </DialogHeader>
          {selectedGadget && (
            <div className="py-4 space-y-4">
              <div className="bg-secondary/30 rounded-xl p-3">
                <p className="font-medium text-foreground">{selectedGadget.name}</p>
                <p className="text-sm text-muted-foreground">{selectedGadget.serialNumber}</p>
              </div>
              <Select value={newCondition} onValueChange={setNewCondition}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select new condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs_repair">Needs Repair</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notes (optional)..."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleUpdateCondition}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Maintenance Modal */}
      <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Maintenance</DialogTitle>
          </DialogHeader>
          {selectedGadget && (
            <div className="py-4 space-y-4">
              <div className="bg-secondary/30 rounded-xl p-3">
                <p className="font-medium text-foreground">{selectedGadget.name}</p>
                <p className="text-sm text-muted-foreground">{selectedGadget.serialNumber}</p>
              </div>
              <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Maintenance type *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="replacement">Part Replacement</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Performed by *"
                value={maintenancePerformedBy}
                onChange={(e) => setMaintenancePerformedBy(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder="Details of work done *"
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Cost (₦)"
                type="number"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowMaintenanceModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleLogMaintenance}>
              Log Maintenance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Gadget Modal (simplified) */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Gadget</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input placeholder="Name *" className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Category *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refrigeration">Refrigeration</SelectItem>
                  <SelectItem value="cooking">Cooking</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Serial Number" className="rounded-xl" />
            </div>
            <Select>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Location *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="store1">Store Room 1</SelectItem>
                <SelectItem value="store2">Store Room 2</SelectItem>
                <SelectItem value="prep">Prep Station</SelectItem>
                <SelectItem value="counter">Counter</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Purchase Date" type="date" className="rounded-xl" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
              Add Gadget
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
    </div>
  );
};

export default GadgetManagement;
