import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draft, setDraft] = useState<{
    category: ExpenseCategory;
    amount: string;
    description: string;
  }>({ category: "supplies", amount: "", description: "" });
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

  const { data, isLoading } = useMyExpenses({ limit: 50 });
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
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({ open: true, type: "error", title: "Invalid amount" });
      return;
    }
    if (!draft.description.trim()) {
      setToast({ open: true, type: "error", title: "Description is required" });
      return;
    }
    create.mutate(
      {
        category: draft.category,
        amount,
        description: draft.description.trim(),
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setDraft({ category: "supplies", amount: "", description: "" });
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
                <p className="text-sm text-foreground">{e.description}</p>
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
      </main>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="rounded-2xl max-w-md">
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
                Amount (₦)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="12500"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="What is this expense for?"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="rounded-xl min-h-[100px]"
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
