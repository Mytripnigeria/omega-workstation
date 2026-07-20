import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Phone,
  Navigation,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import {
  useDeliveries,
  useMyDeliveries,
  useAssignDelivery,
  usePickupDelivery,
  useDeliverDelivery,
  useFailDelivery,
} from "@/hooks/useDeliveries";
import { workstationAuth } from "@/services/api";
import { useFunctionAccess } from "@/hooks/useFunctionAccess";
import { canAccessFunction } from "@/lib/roles";
import FunctionRestricted from "@/components/FunctionRestricted";
import type { Delivery } from "@/types/delivery";

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // Merchant-configured role restriction (workstation settings).
  const { data: functionAccess } = useFunctionAccess();
  const deliveryAllowed = canAccessFunction(
    functionAccess?.functionRoleAccess,
    "delivery",
  );
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
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
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [failModal, setFailModal] = useState<{ open: boolean; deliveryId: string | null }>({
    open: false,
    deliveryId: null,
  });
  const [failReason, setFailReason] = useState("");

  // Active = assigned/in_transit; Completed today = delivered/failed.
  const { data: activePage, isLoading } = useMyDeliveries(
    { status: "assigned,in_transit", limit: 50 },
    5000,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: completedPage } = useMyDeliveries(
    { status: "delivered,failed", dateFrom: today.toISOString().split("T")[0], limit: 50 },
    15000,
  );

  // Available = unassigned deliveries any rider can pick up (self-assign).
  const { data: availablePage } = useDeliveries({ status: "pending", limit: 50 }, 5000);

  const active = activePage?.data ?? [];
  const completed = completedPage?.data ?? [];
  const available = availablePage?.data ?? [];

  const currentStaffId = workstationAuth.getStaff()?.id ?? "";

  const pickup = usePickupDelivery();
  const deliver = useDeliverDelivery();
  const fail = useFailDelivery();
  const assign = useAssignDelivery();

  const handleAccept = (d: Delivery) => {
    assign.mutate(
      { id: d.id, riderStaffId: currentStaffId },
      {
        onSuccess: () =>
          setToast({ open: true, type: "success", title: "Assigned to you", message: `Order #${d.orderNumber} is yours.` }),
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Couldn't accept", message: e.message }),
      },
    );
  };

  const elapsedMin = (iso: string) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

  const handlePickup = (d: Delivery) => {
    setConfirmDialog({
      open: true,
      title: "Pickup confirmed",
      description: `Mark order #${d.orderNumber} as picked up?`,
      action: () =>
        pickup.mutate(d.id, {
          onSuccess: () =>
            setToast({ open: true, type: "success", title: "Picked up", message: `Order #${d.orderNumber} in transit.` }),
          onError: (e: Error) =>
            setToast({ open: true, type: "error", title: "Failed", message: e.message }),
        }),
    });
  };

  const handleDeliver = (d: Delivery) => {
    setConfirmDialog({
      open: true,
      title: "Mark delivered",
      description: `Confirm delivery of order #${d.orderNumber}?`,
      action: () =>
        deliver.mutate(d.id, {
          onSuccess: () => {
            setSelectedDelivery(null);
            setToast({ open: true, type: "success", title: "Delivered", message: `Order #${d.orderNumber} marked as delivered.` });
          },
          onError: (e: Error) =>
            setToast({ open: true, type: "error", title: "Failed", message: e.message }),
        }),
    });
  };

  const submitFail = () => {
    if (!failModal.deliveryId || !failReason.trim()) return;
    fail.mutate(
      { id: failModal.deliveryId, reason: failReason.trim() },
      {
        onSuccess: () => {
          setFailModal({ open: false, deliveryId: null });
          setFailReason("");
          setSelectedDelivery(null);
          setToast({ open: true, type: "warning", title: "Marked as failed" });
        },
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Failed", message: e.message }),
      },
    );
  };

  const statusBadge = (status: Delivery["status"]) => {
    switch (status) {
      case "assigned":
        return <Badge className="bg-status-warning/10 text-status-warning">Assigned</Badge>;
      case "in_transit":
        return <Badge className="bg-status-info/10 text-status-info">In transit</Badge>;
      case "delivered":
        return (
          <Badge className="bg-status-success/10 text-status-success">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!deliveryAllowed) {
    return <FunctionRestricted label="Delivery" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bike className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">My Deliveries</h1>
                  <p className="text-xs text-muted-foreground">
                    {active.length} active • {completed.length} completed today
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "completed")}>
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-card">
              <Bike className="w-4 h-4 mr-1" />
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-card">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Today ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {/* Available to accept — unassigned ready deliveries any rider can take */}
            {available.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Available to accept ({available.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {available.map((d) => (
                    <div key={d.id} className="bg-card border border-border rounded-2xl p-4">
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedDelivery(d)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">#{d.orderNumber}</span>
                          <Badge className="bg-status-warning/10 text-status-warning">New</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {d.customerName ?? "Customer"}
                          {d.items.length > 0 &&
                            ` · ${d.items.reduce((s, i) => s + i.quantity, 0)} item${
                              d.items.reduce((s, i) => s + i.quantity, 0) === 1 ? "" : "s"
                            }`}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {d.address ?? "Delivery address"}
                        </p>
                      </div>
                      <Button
                        className="w-full rounded-xl"
                        onClick={() => handleAccept(d)}
                        disabled={assign.isPending}
                      >
                        Accept order
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <p className="text-center text-muted-foreground py-8">Loading deliveries...</p>
            )}
            {!isLoading && active.length === 0 && available.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Bike className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No active deliveries assigned to you.</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {active.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDelivery(d)}
                  className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">#{d.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {d.customerName ?? "Customer"}
                      </p>
                    </div>
                    {statusBadge(d.status)}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{d.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {elapsedMin(d.createdAt)} min ago
                    </span>
                    {d.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {d.phone}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-2">
              {completed.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No completed deliveries yet today.
                </p>
              )}
              {completed.map((d) => (
                <div
                  key={d.id}
                  className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{d.orderNumber}</span>
                      {statusBadge(d.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {d.customerName ?? "Customer"} • {d.address}
                    </p>
                    {d.failureReason && (
                      <p className="text-xs text-destructive italic mt-1">
                        {d.failureReason}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {d.deliveredAt
                      ? new Date(d.deliveredAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery #{selectedDelivery?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {selectedDelivery.customerName ?? "Customer"}
                  </span>
                  {statusBadge(selectedDelivery.status)}
                </div>
                {selectedDelivery.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selectedDelivery.phone}`} className="text-primary">
                      {selectedDelivery.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{selectedDelivery.address}</span>
                </div>
                {selectedDelivery.notes && (
                  <div className="flex items-start gap-2 text-sm text-status-warning">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{selectedDelivery.notes}</span>
                  </div>
                )}
              </div>

              {selectedDelivery.items.length > 0 && (
                <div className="bg-secondary/50 rounded-xl p-4">
                  <ul className="space-y-1">
                    {selectedDelivery.items.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground">
                            {item.quantity}× {item.name}
                          </span>
                          {item.notes && (
                            <span className="text-xs text-muted-foreground italic">
                              {item.notes}
                            </span>
                          )}
                        </div>
                        {item.variation?.name && (
                          <p className="text-xs text-muted-foreground">{item.variation.name}</p>
                        )}
                        {(item.addons ?? []).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {(item.addons ?? []).map((a) => a.name).filter(Boolean).join(", ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {selectedDelivery.orderTotal != null && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-lg font-bold text-foreground">
                        ₦{Number(selectedDelivery.orderTotal).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {selectedDelivery.latitude && selectedDelivery.longitude && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${selectedDelivery.latitude},${selectedDelivery.longitude}`,
                      "_blank",
                    )
                  }
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              )}

              <div className="flex flex-col gap-2">
                {selectedDelivery.status === "assigned" && (
                  <Button
                    className="rounded-xl"
                    onClick={() => handlePickup(selectedDelivery)}
                    disabled={pickup.isPending}
                  >
                    Mark picked up
                  </Button>
                )}
                {selectedDelivery.status === "in_transit" && (
                  <Button
                    className="rounded-xl bg-status-success text-white hover:bg-status-success/90"
                    onClick={() => handleDeliver(selectedDelivery)}
                    disabled={deliver.isPending}
                  >
                    Mark delivered
                  </Button>
                )}
                {(selectedDelivery.status === "assigned" ||
                  selectedDelivery.status === "in_transit") && (
                  <Button
                    variant="outline"
                    className="rounded-xl border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      setFailModal({ open: true, deliveryId: selectedDelivery.id })
                    }
                  >
                    Mark failed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={failModal.open}
        onOpenChange={(open) => setFailModal({ open, deliveryId: open ? failModal.deliveryId : null })}
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark delivery as failed</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Provide a reason — this will be recorded in the activity log.
            </p>
            <Input
              placeholder="e.g. Customer not at address"
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="rounded-xl"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  setFailModal({ open: false, deliveryId: null });
                  setFailReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={submitFail}
                disabled={!failReason.trim() || fail.isPending}
              >
                Submit
              </Button>
            </div>
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
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Deliveries"
        resourceType="delivery"
      />
    </div>
  );
};

export default DeliveryPage;
