import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { canAccessFunction, canManageOrSupervise } from "@/lib/roles";
import { useFunctionAccess } from "@/hooks/useFunctionAccess";
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  Clock,
  Receipt,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import {
  useMyExpenses,
  useCreateExpense,
  useDeleteExpense,
} from "@/hooks/useExpenses";
import type {
  Expense,
  ExpenseCategory,
  ExpenseItemType,
  ExpenseStatus,
} from "@/types/expense";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "supplies", label: "Supplies" },
  { value: "utilities", label: "Utilities" },
  { value: "maintenance", label: "Maintenance" },
  { value: "transport", label: "Transport" },
  { value: "salaries", label: "Salaries" },
  { value: "other", label: "Other" },
];

/** A line of the submission form, held as strings while the user types. */
interface DraftExpenseItem {
  key: string;
  name: string;
  type: ExpenseItemType;
  unit: string;
  quantity: string;
  unitPrice: string;
  supplier: string;
}

let draftItemSeq = 0;
const blankExpenseItem = (): DraftExpenseItem => ({
  key: `item-${++draftItemSeq}`,
  name: "",
  type: "purchase",
  unit: "",
  quantity: "1",
  unitPrice: "",
  supplier: "",
});

const ITEM_TYPES: { value: ExpenseItemType; label: string }[] = [
  { value: "purchase", label: "Purchase" },
  { value: "expense", label: "Expense" },
];

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draft, setDraft] = useState<{
    category: ExpenseCategory;
    description: string;
    supplierName: string;
  }>({ category: "supplies", description: "", supplierName: "" });

  // A submission is a list of purchased/spent lines, not one lump figure —
  // the client needs name, type, unit, quantity, unit price and supplier per
  // item so the record is auditable against the receipt.
  const [items, setItems] = useState<DraftExpenseItem[]>([blankExpenseItem()]);
  const itemTotal = (i: DraftExpenseItem) =>
    (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0);
  const draftTotal = items.reduce((sum, i) => sum + itemTotal(i), 0);
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
  const [day, setDay] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyExpenses({
    limit: 20,
    page,
    dateFrom: day || undefined,
    dateTo: day || undefined,
  });

  // Merchant-configured role list wins when set; otherwise the built-in
  // manager/supervisor gate applies.
  const { data: functionAccess } = useFunctionAccess();
  const expensesAllowed = canAccessFunction(
    functionAccess?.functionRoleAccess,
    "expenses",
    canManageOrSupervise(),
  );
  const totalPages = data?.totalPages ?? 1;
  const create = useCreateExpense();
  const del = useDeleteExpense();

  const expenses: Expense[] = data?.data ?? [];

  const formatCurrency = (amount: number, currency: string) =>
    `${currency === "NGN" ? "₦" : currency} ${amount.toLocaleString()}`;

  const statusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-status-warning/10 text-status-warning">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-status-info/10 text-status-info">
            <Check className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-status-success/10 text-status-success">
            <Check className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
    }
  };

  const submit = () => {
    const filled = items.filter((i) => i.name.trim());
    if (filled.length === 0) {
      setToast({ open: true, type: "error", title: "Add at least one item" });
      return;
    }
    const invalid = filled.find(
      (i) => !(Number(i.quantity) > 0) || !(Number(i.unitPrice) >= 0),
    );
    if (invalid) {
      setToast({
        open: true,
        type: "error",
        title: "Check quantity and unit price",
        message: `"${invalid.name}" needs a quantity above zero and a unit price.`,
      });
      return;
    }
    create.mutate(
      {
        category: draft.category,
        description: draft.description.trim() || undefined,
        supplierName: draft.supplierName.trim() || undefined,
        items: filled.map((i) => ({
          name: i.name.trim(),
          type: i.type,
          unit: i.unit.trim() || null,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          supplier: i.supplier.trim() || null,
        })),
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setDraft({ category: "supplies", description: "", supplierName: "" });
          setItems([blankExpenseItem()]);
          setToast({
            open: true,
            type: "success",
            title: "Expense submitted",
            message: "A manager will review it shortly.",
          });
        },
        onError: (e: Error) =>
          setToast({
            open: true,
            type: "error",
            title: "Couldn't submit",
            message: e.message,
          }),
      },
    );
  };

  const handleDelete = (e: Expense) => {
    setConfirmDialog({
      open: true,
      title: "Delete expense",
      description: `Delete this pending request for ${formatCurrency(e.amount, e.currency)}?`,
      action: () => {
        del.mutate(e.id, {
          onSuccess: () =>
            setToast({ open: true, type: "success", title: "Deleted" }),
          onError: (err: Error) =>
            setToast({
              open: true,
              type: "error",
              title: "Failed",
              message: err.message,
            }),
        });
      },
    });
  };

  if (!expensesAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h1 className="text-lg font-bold text-foreground mb-1">Restricted</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Expenses are available to managers and supervisors only.
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
                  <Receipt className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">My Expenses</h1>
                  <p className="text-xs text-muted-foreground">
                    {expenses.length} request{expenses.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
              <ActivityLogButton onClick={() => setShowActivityLog(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="page-container max-w-4xl mx-auto">
        {/* Day filter */}
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="date"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setPage(1);
            }}
            className="w-auto rounded-xl"
          />
          {day && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setDay("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {isLoading && (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        )}

        {!isLoading && expenses.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground mb-4">No expense requests yet.</p>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Submit one
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(e.amount, e.currency)}
                  </span>
                  {statusBadge(e.status)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {e.category}
                  </Badge>
                </div>
                {e.description && (
                  <p className="text-sm text-foreground">{e.description}</p>
                )}
                {/* Itemised submissions list their lines; legacy ones only had
                    the free-text description above. */}
                {e.items?.length ? (
                  <div className="mt-2 space-y-1">
                    {e.items.map((it, i) => (
                      <div
                        key={`${e.id}-${i}`}
                        className="flex items-start justify-between gap-3 text-xs"
                      >
                        <span className="text-foreground">
                          {it.name}
                          <span className="text-muted-foreground">
                            {" · "}
                            {it.type === "purchase" ? "Purchase" : "Expense"}
                            {" · "}
                            {it.quantity}
                            {it.unit ? ` ${it.unit}` : ""} × ₦
                            {Number(it.unitPrice).toLocaleString()}
                            {it.supplier ? ` · ${it.supplier}` : ""}
                          </span>
                        </span>
                        <span className="font-medium text-foreground whitespace-nowrap">
                          ₦{Number(it.total).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {e.supplierName && !e.items?.length && (
                  <p className="text-xs text-muted-foreground">
                    Supplier: {e.supplierName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted {new Date(e.createdAt).toLocaleString()}
                </p>
                {e.reviewedAt && (
                  <p className="text-xs text-muted-foreground">
                    {e.status === "approved"
                      ? "Approved"
                      : e.status === "rejected"
                        ? "Rejected"
                        : "Reviewed"}{" "}
                    by {e.reviewedByName ?? "manager"} ·{" "}
                    {new Date(e.reviewedAt).toLocaleString()}
                  </p>
                )}
                {e.reviewNotes && (
                  <p className="text-xs italic text-muted-foreground mt-1">
                    "{e.reviewNotes}"
                  </p>
                )}
              </div>
              {e.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(e)}
                  disabled={del.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New expense request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <Select
                value={draft.category}
                onValueChange={(v) =>
                  setDraft({ ...draft, category: v as ExpenseCategory })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Supplier (optional)
              </label>
              <Input
                placeholder="Who was this bought from?"
                value={draft.supplierName}
                onChange={(e) =>
                  setDraft({ ...draft, supplierName: e.target.value })
                }
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Applies to every item unless an item names its own.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Items
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setItems((prev) => [...prev, blankExpenseItem()])}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-border p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === index ? { ...it, name: e.target.value } : it,
                            ),
                          )
                        }
                        className="rounded-lg"
                      />
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-muted-foreground"
                          onClick={() =>
                            setItems((prev) => prev.filter((_, i) => i !== index))
                          }
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={item.type}
                        onValueChange={(v) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === index
                                ? { ...it, type: v as ExpenseItemType }
                                : it,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Unit (kg, pcs…)"
                        value={item.unit}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === index ? { ...it, unit: e.target.value } : it,
                            ),
                          )
                        }
                        className="rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === index
                                ? { ...it, quantity: e.target.value }
                                : it,
                            ),
                          )
                        }
                        className="rounded-lg"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit price (₦)"
                        value={item.unitPrice}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === index
                                ? { ...it, unitPrice: e.target.value }
                                : it,
                            ),
                          )
                        }
                        className="rounded-lg"
                      />
                    </div>

                    <Input
                      placeholder="Supplier for this item (optional)"
                      value={item.supplier}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === index ? { ...it, supplier: e.target.value } : it,
                          ),
                        )
                      }
                      className="rounded-lg"
                    />

                    <p className="text-xs text-muted-foreground text-right">
                      Line total: ₦{itemTotal(item).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-base font-bold text-foreground">
                  ₦{draftTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                placeholder="Anything the manager should know?"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={submit}
              disabled={create.isPending}
            >
              Submit
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
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="My Expenses"
        resourceType="expense"
      />
    </div>
  );
};

export default ExpensesPage;
