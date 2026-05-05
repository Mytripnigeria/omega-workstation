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
import { workstationAuth } from "@/services/api";
import {
  usePrinters,
  useCreatePrinter,
  useUpdatePrinter,
  useDeletePrinter,
} from "@/hooks/usePrinters";
import type { Printer as PrinterT, PrinterConnection, PrinterType } from "@/types/printer";

const TYPES: { value: PrinterType; label: string }[] = [
  { value: "receipt", label: "Receipt Printer" },
  { value: "kitchen", label: "Kitchen Ticket" },
  { value: "bar", label: "Bar Printer" },
  { value: "label", label: "Label Printer" },
];

const CONNECTIONS: { value: PrinterConnection; label: string }[] = [
  { value: "network", label: "Network (IP)" },
  { value: "usb", label: "USB" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "cloud", label: "Cloud" },
];

interface NewPrinterDraft {
  name: string;
  type: PrinterType;
  connection: PrinterConnection;
  address: string;
  paperWidth: "58mm" | "80mm";
  autoCut: boolean;
  copies: number;
}

const DRAFT_DEFAULT: NewPrinterDraft = {
  name: "",
  type: "receipt",
  connection: "network",
  address: "",
  paperWidth: "80mm",
  autoCut: true,
  copies: 1,
};

const PrinterSettingsPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const { data: printers = [], isLoading } = usePrinters(staff?.storeId);
  const createPrinter = useCreatePrinter();
  const updatePrinter = useUpdatePrinter();
  const deletePrinter = useDeletePrinter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [draft, setDraft] = useState<NewPrinterDraft>(DRAFT_DEFAULT);

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

  const handleAdd = () => {
    if (!staff?.storeId) {
      setToast({ open: true, type: "error", title: "No store", message: "Cannot create printer outside a store context." });
      return;
    }
    if (!draft.name.trim()) {
      setToast({ open: true, type: "error", title: "Name is required" });
      return;
    }
    createPrinter.mutate(
      {
        storeId: staff.storeId,
        name: draft.name.trim(),
        type: draft.type,
        connection: draft.connection,
        address: draft.address || undefined,
        config: {
          paperWidth: draft.paperWidth,
          autoCut: draft.autoCut,
          copies: draft.copies,
        },
        isActive: true,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setDraft(DRAFT_DEFAULT);
          setToast({ open: true, type: "success", title: "Printer added" });
        },
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Failed to add", message: e.message }),
      },
    );
  };

  const handleDelete = (printer: PrinterT) => {
    setConfirmDialog({
      open: true,
      title: "Delete Printer",
      description: `Are you sure you want to delete "${printer.name}"?`,
      action: () => {
        deletePrinter.mutate(printer.id, {
          onSuccess: () => setToast({ open: true, type: "success", title: "Printer deleted" }),
          onError: (e: Error) =>
            setToast({ open: true, type: "error", title: "Delete failed", message: e.message }),
        });
      },
    });
  };

  const handleToggleActive = (printer: PrinterT) => {
    updatePrinter.mutate(
      { id: printer.id, data: { isActive: !printer.isActive } },
      {
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Update failed", message: e.message }),
      },
    );
  };

  const handleTestPrint = (printer: PrinterT) => {
    setToast({
      open: true,
      type: "info",
      title: "Test Print",
      message: `Test print for ${printer.name} requires a print server (not implemented).`,
    });
  };

  // A printer is considered "online" if it has a recent heartbeat (last 5 min).
  const isOnline = (printer: PrinterT) => {
    if (!printer.lastSeenAt) return false;
    const ms = Date.now() - new Date(printer.lastSeenAt).getTime();
    return ms < 5 * 60 * 1000;
  };

  const getTypeColor = (type: PrinterType) => {
    switch (type) {
      case "receipt":
        return "bg-primary/10 text-primary";
      case "kitchen":
        return "bg-status-warning/10 text-status-warning";
      case "label":
        return "bg-status-info/10 text-status-info";
      case "bar":
        return "bg-status-success/10 text-status-success";
      default:
        return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading printers...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.map((printer) => {
              const online = isOnline(printer);
              const config = (printer.config ?? {}) as { paperWidth?: string; autoCut?: boolean; copies?: number };
              return (
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
                          {!printer.isActive && (
                            <Badge variant="outline" className="rounded-lg text-xs bg-muted text-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        online
                          ? "bg-status-success/10 text-status-success"
                          : "bg-status-error/10 text-status-error"
                      }`}
                    >
                      {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {online ? "Online" : "Offline"}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <span className="text-foreground">{printer.connection.toUpperCase()}</span>
                    </div>
                    {printer.address && (
                      <div className="flex justify-between">
                        <span>Address:</span>
                        <span className="text-foreground font-mono">{printer.address}</span>
                      </div>
                    )}
                    {config.paperWidth && (
                      <div className="flex justify-between">
                        <span>Paper Width:</span>
                        <span className="text-foreground">{String(config.paperWidth)}</span>
                      </div>
                    )}
                    {config.copies !== undefined && (
                      <div className="flex justify-between">
                        <span>Copies:</span>
                        <span className="text-foreground">{Number(config.copies)}</span>
                      </div>
                    )}
                    {config.autoCut !== undefined && (
                      <div className="flex justify-between items-center">
                        <span>Auto Cut:</span>
                        <span>
                          {config.autoCut ? (
                            <Check className="w-4 h-4 text-status-success" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                        </span>
                      </div>
                    )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => handleToggleActive(printer)}
                      disabled={updatePrinter.isPending}
                    >
                      {printer.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-status-error hover:bg-status-error/10"
                      onClick={() => handleDelete(printer)}
                      disabled={deletePrinter.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

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
        )}
      </div>

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
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Printer Type</label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as PrinterType })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Connection</label>
              <Select
                value={draft.connection}
                onValueChange={(v) => setDraft({ ...draft, connection: v as PrinterConnection })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Address</label>
              <Input
                placeholder={draft.connection === "network" ? "192.168.1.100:9100" : "Device path / id"}
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Paper Width</label>
              <Select
                value={draft.paperWidth}
                onValueChange={(v) => setDraft({ ...draft, paperWidth: v as "58mm" | "80mm" })}
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
                checked={draft.autoCut}
                onCheckedChange={(v) => setDraft({ ...draft, autoCut: v })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Copies</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={draft.copies}
                onChange={(e) => setDraft({ ...draft, copies: Math.max(1, parseInt(e.target.value) || 1) })}
                className="rounded-xl w-24"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleAdd} disabled={createPrinter.isPending}>
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
