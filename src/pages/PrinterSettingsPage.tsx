import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Check,
  X,
  Wifi,
  WifiOff,
  Settings,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

interface PrinterConfig {
  id: string;
  name: string;
  type: "receipt" | "kitchen" | "label";
  connectionType: "usb" | "network" | "bluetooth";
  ipAddress?: string;
  port?: number;
  isDefault: boolean;
  isOnline: boolean;
  paperWidth: "58mm" | "80mm";
  autoCut: boolean;
  copies: number;
}

const mockPrinters: PrinterConfig[] = [
  {
    id: "p1",
    name: "Front Counter Receipt",
    type: "receipt",
    connectionType: "network",
    ipAddress: "192.168.1.100",
    port: 9100,
    isDefault: true,
    isOnline: true,
    paperWidth: "80mm",
    autoCut: true,
    copies: 1,
  },
  {
    id: "p2",
    name: "Kitchen Ticket Printer",
    type: "kitchen",
    connectionType: "network",
    ipAddress: "192.168.1.101",
    port: 9100,
    isDefault: false,
    isOnline: true,
    paperWidth: "80mm",
    autoCut: true,
    copies: 2,
  },
  {
    id: "p3",
    name: "Bar Printer",
    type: "kitchen",
    connectionType: "usb",
    isDefault: false,
    isOnline: false,
    paperWidth: "58mm",
    autoCut: false,
    copies: 1,
  },
];

const printerTypes = [
  { value: "receipt", label: "Receipt Printer" },
  { value: "kitchen", label: "Kitchen Ticket" },
  { value: "label", label: "Label Printer" },
];

const connectionTypes = [
  { value: "usb", label: "USB" },
  { value: "network", label: "Network (IP)" },
  { value: "bluetooth", label: "Bluetooth" },
];

const PrinterSettingsPage = () => {
  const navigate = useNavigate();
  const [printers, setPrinters] = useState<PrinterConfig[]>(mockPrinters);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);

  const [newPrinter, setNewPrinter] = useState<Partial<PrinterConfig>>({
    name: "",
    type: "receipt",
    connectionType: "network",
    ipAddress: "",
    port: 9100,
    isDefault: false,
    paperWidth: "80mm",
    autoCut: true,
    copies: 1,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ open: false, type: "success", title: "" });

  const handleAddPrinter = () => {
    if (!newPrinter.name) {
      setToast({ open: true, type: "error", title: "Error", message: "Please enter a printer name" });
      return;
    }

    const printer: PrinterConfig = {
      id: `p-${Date.now()}`,
      name: newPrinter.name!,
      type: newPrinter.type as "receipt" | "kitchen" | "label",
      connectionType: newPrinter.connectionType as "usb" | "network" | "bluetooth",
      ipAddress: newPrinter.ipAddress,
      port: newPrinter.port,
      isDefault: newPrinter.isDefault || false,
      isOnline: false,
      paperWidth: newPrinter.paperWidth as "58mm" | "80mm",
      autoCut: newPrinter.autoCut || false,
      copies: newPrinter.copies || 1,
    };

    setPrinters([...printers, printer]);
    setNewPrinter({
      name: "",
      type: "receipt",
      connectionType: "network",
      ipAddress: "",
      port: 9100,
      isDefault: false,
      paperWidth: "80mm",
      autoCut: true,
      copies: 1,
    });
    setShowAddModal(false);
    setToast({ open: true, type: "success", title: "Printer Added", message: `${printer.name} has been added` });
  };

  const handleDeletePrinter = (printer: PrinterConfig) => {
    setConfirmDialog({
      open: true,
      title: "Delete Printer",
      description: `Are you sure you want to delete "${printer.name}"?`,
      action: () => {
        setPrinters(printers.filter((p) => p.id !== printer.id));
        setToast({ open: true, type: "success", title: "Printer Deleted" });
      },
    });
  };

  const handleTestPrint = (printer: PrinterConfig) => {
    setToast({
      open: true,
      type: "info",
      title: "Test Print",
      message: `Sending test page to ${printer.name}...`,
    });
    // Simulate test print
    setTimeout(() => {
      if (printer.isOnline) {
        setToast({ open: true, type: "success", title: "Test Successful", message: "Test page printed successfully" });
      } else {
        setToast({ open: true, type: "error", title: "Test Failed", message: "Printer is offline" });
      }
    }, 1500);
  };

  const handleSetDefault = (printerId: string, type: string) => {
    setPrinters(
      printers.map((p) => ({
        ...p,
        isDefault: p.type === type ? p.id === printerId : p.isDefault,
      }))
    );
    setToast({ open: true, type: "success", title: "Default Updated" });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "receipt":
        return "bg-primary/10 text-primary";
      case "kitchen":
        return "bg-status-warning/10 text-status-warning";
      case "label":
        return "bg-status-info/10 text-status-info";
      default:
        return "bg-secondary text-foreground";
    }
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
                <Printer className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Printer Settings</h1>
                <p className="text-sm text-muted-foreground">{printers.length} printers configured</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Printer
            </Button>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Printer List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map((printer) => (
            <div
              key={printer.id}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getTypeColor(printer.type)} flex items-center justify-center`}>
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{printer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-lg text-xs">
                        {printer.type}
                      </Badge>
                      {printer.isDefault && (
                        <Badge className="bg-primary/10 text-primary rounded-lg text-xs">Default</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  printer.isOnline 
                    ? "bg-status-success/10 text-status-success" 
                    : "bg-status-error/10 text-status-error"
                }`}>
                  {printer.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {printer.isOnline ? "Online" : "Offline"}
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className="text-foreground">{printer.connectionType.toUpperCase()}</span>
                </div>
                {printer.ipAddress && (
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span className="text-foreground font-mono">{printer.ipAddress}:{printer.port}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Paper Width:</span>
                  <span className="text-foreground">{printer.paperWidth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Copies:</span>
                  <span className="text-foreground">{printer.copies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Auto Cut:</span>
                  <span>{printer.autoCut ? <Check className="w-4 h-4 text-status-success" /> : <X className="w-4 h-4 text-muted-foreground" />}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => handleTestPrint(printer)}
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  Test
                </Button>
                {!printer.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => handleSetDefault(printer.id, printer.type)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-status-error hover:bg-status-error/10"
                  onClick={() => handleDeletePrinter(printer)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Printer Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-card border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-secondary/30 transition-colors min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="font-medium text-muted-foreground">Add New Printer</span>
          </button>
        </div>
      </div>

      {/* Add Printer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Add Printer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Printer Name *</label>
              <Input
                placeholder="e.g., Front Counter Receipt"
                value={newPrinter.name}
                onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Printer Type</label>
              <Select
                value={newPrinter.type}
                onValueChange={(v) => setNewPrinter({ ...newPrinter, type: v as any })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {printerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Connection Type</label>
              <Select
                value={newPrinter.connectionType}
                onValueChange={(v) => setNewPrinter({ ...newPrinter, connectionType: v as any })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newPrinter.connectionType === "network" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">IP Address</label>
                  <Input
                    placeholder="192.168.1.100"
                    value={newPrinter.ipAddress}
                    onChange={(e) => setNewPrinter({ ...newPrinter, ipAddress: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Port</label>
                  <Input
                    type="number"
                    placeholder="9100"
                    value={newPrinter.port}
                    onChange={(e) => setNewPrinter({ ...newPrinter, port: parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Paper Width</label>
              <Select
                value={newPrinter.paperWidth}
                onValueChange={(v) => setNewPrinter({ ...newPrinter, paperWidth: v as any })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">58mm</SelectItem>
                  <SelectItem value="80mm">80mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Auto Cut</span>
              <Switch
                checked={newPrinter.autoCut}
                onCheckedChange={(v) => setNewPrinter({ ...newPrinter, autoCut: v })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Copies</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={newPrinter.copies}
                onChange={(e) => setNewPrinter({ ...newPrinter, copies: parseInt(e.target.value) })}
                className="rounded-xl w-24"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleAddPrinter}>
              Add Printer
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
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Printer Settings" />
    </div>
  );
};

export default PrinterSettingsPage;