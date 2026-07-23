import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  AlertTriangle,
  Filter,
  ArrowLeft,
  Eye,
  Minus,
  Repeat,
  History,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import ItemDetailsModal from "@/components/ItemDetailsModal";
import InventoryMovementLog from "@/components/InventoryMovementLog";
import { workstationAuth } from "@/services/api";
import { useIngredients, useAdjustStock } from "@/hooks/useIngredients";
import { useTransferToLocation } from "@/hooks/useMovements";
import { useInventoryLocations } from "@/hooks/useInventoryLocations";
import { useFunctionAccess } from "@/hooks/useFunctionAccess";
import { canAccessFunction } from "@/lib/roles";
import { useQuery } from "@tanstack/react-query";
import { ingredientsService } from "@/services/ingredients";
import type { Ingredient } from "@/types/ingredient";

const ALL = "__all__";

/** Staff on manager/supervisor roles may access store-room screens. */
function canAccessStoreRooms(): boolean {
  const staff = workstationAuth.getStaff();
  if (!staff) return false;
  const role = (staff.roleName ?? "").toLowerCase();
  if (role.includes("manager") || role.includes("supervisor")) return true;
  return (staff.permissions ?? []).some((p) =>
    ["manage_inventory", "manage_orders", "manage_store"].includes(p),
  );
}

const OutstorePage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  // Merchant-configured role list wins when set; otherwise the built-in
  // manager/supervisor gate applies.
  const { data: functionAccess } = useFunctionAccess();
  const allowed = canAccessFunction(
    functionAccess?.functionRoleAccess,
    "outstore",
    canAccessStoreRooms(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [locationId, setLocationId] = useState<string>(ALL);
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [adjustModal, setAdjustModal] = useState<{
    open: boolean;
    item: Ingredient | null;
    direction: "add" | "subtract" | "waste";
  }>({ open: false, item: null, direction: "add" });
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLocationId, setAdjustLocationId] = useState("");
  const [transferModal, setTransferModal] = useState<{
    open: boolean;
    item: Ingredient | null;
  }>({ open: false, item: null });
  const [transferFromLoc, setTransferFromLoc] = useState("");
  const [transferToLoc, setTransferToLoc] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ open: false, type: "success", title: "" });

  // Out-Store type locations for the location filter. Gated on role so a
  // non-manager never fires the request (also avoids the forced-logout path).
  const { data: locPage } = useInventoryLocations(
    {
      storeId: staff?.storeId,
      type: "outstore",
      limit: 100,
    },
    { enabled: allowed },
  );
  const locations = locPage?.data ?? [];

  // Every store location regardless of type — transfers can send stock to any
  // location (e.g. Out-Store service → another Out-Store point), and the
  // backend auto-creates the destination stock row if the item isn't there.
  const { data: allLocPage } = useInventoryLocations(
    { storeId: staff?.storeId, limit: 100 },
    { enabled: allowed },
  );
  const allLocations = allLocPage?.data ?? [];

  // Ids of the Out-Store locations, used to keep every location picker on this
  // page to Out-Store only (client spec: Use/Waste may only offer out-store
  // locations, and a transfer out of here must land in-store).
  const outstoreIds = useMemo(
    () => new Set(locations.map((l) => l.id)),
    [locations],
  );
  /** An ingredient's stock rows, narrowed to Out-Store locations. */
  const outstoreRowsOf = useCallback(
    (item?: { locations?: { locationId: string; currentStock: number; minStock?: number }[] } | null) =>
      (item?.locations ?? []).filter((l) => outstoreIds.has(l.locationId)),
    [outstoreIds],
  );

  const { data: page, isLoading } = useIngredients(
    {
      storeId: staff?.storeId,
      status: statusFilter === "low" ? "low" : undefined,
      locationId: locationId === ALL ? undefined : locationId,
      limit: 100,
    },
    { enabled: allowed },
  );

  const ingredients = useMemo(() => page?.data ?? [], [page]);

  const filteredItems = ingredients.filter((i) =>
    !searchQuery
      ? true
      : i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const adjustStock = useAdjustStock();
  const transfer = useTransferToLocation();

  const transferLocsQuery = useQuery({
    queryKey: ["ingredient-locations", transferModal.item?.id],
    queryFn: () => ingredientsService.listLocations(transferModal.item!.id),
    enabled: !!transferModal.item,
  });
  const itemLocations = transferLocsQuery.data ?? [];
  const locationName = (id: string) =>
    allLocations.find((l) => l.id === id)?.name ??
    locations.find((l) => l.id === id)?.name ??
    id;
  const itemStockAt = (locId: string) =>
    Number(
      itemLocations.find((l) => l.locationId === locId)?.currentStock ?? 0,
    );

  // When a specific location is selected, show that location's stock (the
  // quantity tagged to that location) rather than the aggregate. The Out-Store
  // page in particular must show the per-location count, not the total.
  /**
   * Stock as this page should report it. With a location selected that's that
   * location's row; with "All locations" it's the total across Out-Store
   * locations only — the global aggregate would include In-Store bulk stock
   * that hasn't reached the kitchen yet.
   */
  const displayStockFor = (i: Ingredient): { current: number; min: number } => {
    if (locationId === ALL) {
      const rows = outstoreRowsOf(i);
      if (rows.length === 0) {
        return { current: Number(i.currentStock), min: Number(i.minStock) };
      }
      return {
        current: rows.reduce((sum, l) => sum + Number(l.currentStock), 0),
        min: rows.reduce((sum, l) => sum + Number(l.minStock ?? 0), 0),
      };
    }
    const loc = i.locations?.find((l) => l.locationId === locationId);
    return { current: Number(loc?.currentStock ?? 0), min: Number(loc?.minStock ?? 0) };
  };

  const isLowStock = (i: Ingredient) => {
    const { current, min } = displayStockFor(i);
    return current <= min;
  };

  const openAdjust = (
    item: Ingredient,
    direction: "add" | "subtract" | "waste",
  ) => {
    setAdjustModal({ open: true, item, direction });
    setAdjustAmount("");
    setAdjustReason(direction === "waste" ? "Spoilage" : "");
    // Default to the currently filtered location, else the item's only location.
    const itemLocs = item.locations ?? [];
    setAdjustLocationId(
      locationId !== ALL
        ? locationId
        : itemLocs.length === 1
          ? itemLocs[0].locationId
          : "",
    );
  };

  const submitAdjust = () => {
    if (!adjustModal.item) return;
    const qty = Number(adjustAmount);
    if (!Number.isFinite(qty) || qty <= 0) {
      setToast({ open: true, type: "error", title: "Invalid quantity" });
      return;
    }
    const signed = adjustModal.direction === "add" ? qty : -qty;
    if (adjustModal.direction === "waste" && !adjustReason.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Reason required",
        message: "Please provide a reason for waste.",
      });
      return;
    }
    // The backend requires a target location when the item is stocked in more
    // than one — so the stock lands in the chosen Out-Store location.
    if ((adjustModal.item.locations?.length ?? 0) > 1 && !adjustLocationId) {
      setToast({ open: true, type: "error", title: "Pick a location" });
      return;
    }
    adjustStock.mutate(
      {
        id: adjustModal.item.id,
        adjustment: signed,
        reason: adjustReason.trim() || undefined,
        // Tag the movement as WASTE so the merchant hub Waste Management view
        // picks it up. Add/subtract keep the default classification.
        type: adjustModal.direction === "waste" ? "waste" : undefined,
        locationId: adjustLocationId || undefined,
      },
      {
        onSuccess: () => {
          setAdjustModal({ open: false, item: null, direction: "add" });
          setToast({
            open: true,
            type: adjustModal.direction === "waste" ? "warning" : "success",
            title:
              adjustModal.direction === "waste"
                ? "Waste recorded"
                : adjustModal.direction === "add"
                  ? "Stock added"
                  : "Stock reduced",
            message: `${adjustModal.item?.name}: ${signed > 0 ? "+" : ""}${signed} ${adjustModal.item?.unit}`,
          });
        },
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Failed", message: e.message }),
      },
    );
  };

  const openTransfer = (item: Ingredient) => {
    setTransferModal({ open: true, item });
    setTransferFromLoc("");
    setTransferToLoc("");
    setTransferQty("");
    setTransferReason("");
  };

  const submitTransfer = () => {
    if (!transferModal.item || !transferFromLoc || !transferToLoc) {
      setToast({ open: true, type: "error", title: "Pick source and destination locations" });
      return;
    }
    if (transferFromLoc === transferToLoc) {
      setToast({ open: true, type: "error", title: "Locations must differ" });
      return;
    }
    const qty = Number(transferQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setToast({ open: true, type: "error", title: "Invalid quantity" });
      return;
    }
    transfer.mutate(
      {
        id: transferModal.item.id,
        fromLocationId: transferFromLoc,
        toLocationId: transferToLoc,
        quantity: qty,
        reason: transferReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTransferModal({ open: false, item: null });
          setToast({ open: true, type: "success", title: "Transfer recorded" });
        },
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: "Failed", message: e.message }),
      },
    );
  };

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h1 className="text-lg font-bold text-foreground mb-1">Restricted</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Outstore inventory is available to managers and supervisors only.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-xl">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
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
                  <Package className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Outstore (Kitchen)</h1>
                  <p className="text-xs text-muted-foreground">
                    {ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="items" className="rounded-lg data-[state=active]:bg-card">
              <Package className="w-4 h-4 mr-1" />
              Items
            </TabsTrigger>
            <TabsTrigger value="movements" className="rounded-lg data-[state=active]:bg-card">
              <History className="w-4 h-4 mr-1" />
              Movements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="w-full sm:w-52 rounded-xl">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All items</SelectItem>
                  <SelectItem value="low">Low stock only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            )}

            {!isLoading && filteredItems.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No ingredients match.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((i) => {
                const low = isLowStock(i);
                const stock = displayStockFor(i);
                return (
                  <div
                    key={i.id}
                    className={`bg-card border rounded-2xl p-4 ${
                      low ? "border-status-warning" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{i.name}</h3>
                        {i.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {i.sku}</p>
                        )}
                      </div>
                      {low && (
                        <Badge className="bg-status-warning/10 text-status-warning">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Low
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stock.current}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {i.unit}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {locationId === ALL
                        ? "Across all locations"
                        : `at ${locationName(locationId)}`}
                    </p>
                    {/* No "Add" here: Out-Store stock only ever arrives by
                        transfer from In-Store, so adding it directly would
                        create inventory out of nowhere. */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => openAdjust(i, "subtract")}
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => openAdjust(i, "waste")}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Waste
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => openTransfer(i)}
                      >
                        <Repeat className="w-4 h-4 mr-1" />
                        Transfer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg col-span-2"
                        onClick={() => setSelectedItem(i)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details & history
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="movements">
            <InventoryMovementLog />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={adjustModal.open}
        onOpenChange={(open) =>
          setAdjustModal((s) => ({ ...s, open: open ? s.open : false }))
        }
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {adjustModal.direction === "waste"
                ? "Record waste"
                : adjustModal.direction === "add"
                  ? "Add stock"
                  : "Use stock"}
              {adjustModal.item ? ` — ${adjustModal.item.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {outstoreRowsOf(adjustModal.item).length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Location
                </label>
                <Select value={adjustLocationId} onValueChange={setAdjustLocationId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {outstoreRowsOf(adjustModal.item).map((l) => (
                      <SelectItem key={l.locationId} value={l.locationId}>
                        {locationName(l.locationId)} ({Number(l.currentStock)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantity ({adjustModal.item?.unit})
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reason {adjustModal.direction === "waste" ? "(required)" : "(optional)"}
              </label>
              <Textarea
                placeholder={
                  adjustModal.direction === "waste"
                    ? "e.g. Spoilage, expired, dropped"
                    : adjustModal.direction === "add"
                      ? "e.g. Restock from supplier"
                      : "e.g. Used in tonight's service"
                }
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() =>
                  setAdjustModal({ open: false, item: null, direction: "add" })
                }
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={submitAdjust}
                disabled={adjustStock.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={transferModal.open}
        onOpenChange={(open) =>
          setTransferModal((s) => ({ ...s, open: open ? s.open : false }))
        }
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Transfer {transferModal.item?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                From location
              </label>
              <Select value={transferFromLoc} onValueChange={setTransferFromLoc}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Source location" />
                </SelectTrigger>
                <SelectContent>
                  {itemLocations
                    .filter((l) => outstoreIds.has(l.locationId))
                    .map((l) => (
                      <SelectItem key={l.locationId} value={l.locationId}>
                        {locationName(l.locationId)} ({Number(l.currentStock)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                To location
              </label>
              <Select value={transferToLoc} onValueChange={setTransferToLoc}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Destination location" />
                </SelectTrigger>
                <SelectContent>
                  {allLocations
                    .filter(
                      (l) => l.id !== transferFromLoc && l.type === "instore",
                    )
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} ({itemStockAt(l.id)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {itemLocations.filter((l) => outstoreIds.has(l.locationId))
                .length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Item has no stocked Out-Store location to transfer from.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantity ({transferModal.item?.unit})
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reason (optional)
              </label>
              <Textarea
                placeholder="e.g. Return excess to instore"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setTransferModal({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={submitTransfer}
                disabled={!transferFromLoc || !transferToLoc || transfer.isPending}
              >
                Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ItemDetailsModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={
          selectedItem
            ? {
                id: selectedItem.id,
                name: selectedItem.name,
                category: "Ingredient",
                // The stock at the selected Out-Store location (or the
                // Out-Store total under "All locations") — not the global
                // figure, which also counts In-Store bulk stock.
                quantity: displayStockFor(selectedItem).current,
                unit: selectedItem.unit,
                location: locationId === ALL ? selectedItem.storeId : locationId,
                locationName:
                  locationId === ALL ? "All Out-Store" : locationName(locationId),
              }
            : null
        }
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
        pageName="Outstore"
        resourceType="ingredient"
      />
    </div>
  );
};

export default OutstorePage;
