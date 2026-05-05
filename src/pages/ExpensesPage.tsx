import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  Clock,
  DollarSign,
  FileText,
  User,
  Calendar,
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
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { DataTable } from "@/components/DataTable";
import { useCategories } from "@/hooks/useCategories";
import CategoryLoadError from "@/components/CategoryLoadError";

interface ExpenseRequest {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

const mockExpenses: ExpenseRequest[] = [
  {
    id: "exp1",
    title: "Kitchen gas refill",
    amount: 15000,
    category: "Supplies",
    description: "Monthly gas cylinder refill for kitchen operations",
    requestedBy: "John Adeyemi",
    requestedAt: new Date(Date.now() - 2 * 60 * 60000),
    status: "pending",
  },
  {
    id: "exp2",
    title: "Delivery bike fuel",
    amount: 5000,
    category: "Transport",
    description: "Weekly fuel allowance for delivery bikes",
    requestedBy: "Michael Bello",
    requestedAt: new Date(Date.now() - 5 * 60 * 60000),
    status: "pending",
  },
  {
    id: "exp3",
    title: "AC maintenance",
    amount: 25000,
    category: "Maintenance",
    description: "Quarterly AC servicing and cleaning",
    requestedBy: "Sarah Okonkwo",
    requestedAt: new Date(Date.now() - 24 * 60 * 60000),
    status: "approved",
    approvedBy: "Manager",
    approvedAt: new Date(Date.now() - 20 * 60 * 60000),
  },
  {
    id: "exp4",
    title: "Cleaning supplies",
    amount: 8000,
    category: "Supplies",
    description: "Detergents, mops, and cleaning chemicals",
    requestedBy: "Amara Eze",
    requestedAt: new Date(Date.now() - 48 * 60 * 60000),
    status: "rejected",
    rejectionReason: "Duplicate request - supplies already ordered",
  },
];

const ExpensesPage = () => {
  const navigate = useNavigate();
  const {
    data: expenseCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories("expense");
  const [expenses, setExpenses] = useState<ExpenseRequest[]>(mockExpenses);
  const [activeTab, setActiveTab] = useState("pending");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
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

  // Mock current user role - in real app, get from auth
  const isManager = true;
  const currentUser = "John Adeyemi";

  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const approvedExpenses = expenses.filter((e) => e.status === "approved");
  const rejectedExpenses = expenses.filter((e) => e.status === "rejected");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitExpense = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Please fill in all required fields",
      });
      return;
    }

    const expense: ExpenseRequest = {
      id: `exp-${Date.now()}`,
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      requestedBy: currentUser,
      requestedAt: new Date(),
      status: "pending",
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ title: "", amount: "", category: "", description: "" });
    setShowAddModal(false);
    setToast({
      open: true,
      type: "success",
      title: "Request Submitted",
      message: "Your expense request has been sent for approval",
    });
  };

  const handleApprove = (expense: ExpenseRequest) => {
    setConfirmDialog({
      open: true,
      title: "Approve Expense",
      description: `Approve ${formatCurrency(expense.amount)} for "${expense.title}"?`,
      action: () => {
        setExpenses(
          expenses.map((e) =>
            e.id === expense.id
              ? { ...e, status: "approved" as const, approvedBy: "Manager", approvedAt: new Date() }
              : e
          )
        );
        setToast({ open: true, type: "success", title: "Expense Approved" });
      },
    });
  };

  const handleReject = () => {
    if (!selectedExpense) return;
    if (!rejectionReason.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Please provide a reason for rejection",
      });
      return;
    }

    setExpenses(
      expenses.map((e) =>
        e.id === selectedExpense.id
          ? { ...e, status: "rejected" as const, rejectionReason }
          : e
      )
    );
    setShowApproveModal(false);
    setSelectedExpense(null);
    setRejectionReason("");
    setToast({ open: true, type: "info", title: "Expense Rejected" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-status-warning/10 text-status-warning border-status-warning/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-status-success/10 text-status-success border-status-success/30">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-status-error/10 text-status-error border-status-error/30">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const expenseColumns = [
    {
      key: "title",
      label: "Expense",
      sortable: true,
      render: (item: ExpenseRequest) => (
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (item: ExpenseRequest) => (
        <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "requestedBy",
      label: "Requested By",
      sortable: true,
      render: (item: ExpenseRequest) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-foreground">{item.requestedBy}</span>
        </div>
      ),
    },
    {
      key: "requestedAt",
      label: "Date",
      sortable: true,
      render: (item: ExpenseRequest) => (
        <span className="text-muted-foreground">{formatTime(item.requestedAt)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: ExpenseRequest) => getStatusBadge(item.status),
    },
    ...(isManager && activeTab === "pending"
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (item: ExpenseRequest) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(item);
                  }}
                  className="rounded-lg text-status-success border-status-success/30 hover:bg-status-success/10"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExpense(item);
                    setShowApproveModal(true);
                  }}
                  className="rounded-lg text-status-error border-status-error/30 hover:bg-status-error/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case "pending":
        return pendingExpenses;
      case "approved":
        return approvedExpenses;
      case "rejected":
        return rejectedExpenses;
      default:
        return expenses;
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
                <DollarSign className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
                <p className="text-sm text-muted-foreground">
                  {pendingExpenses.length} pending requests
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-status-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingExpenses.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-success/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(approvedExpenses.reduce((sum, e) => sum + e.amount, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-error/10 flex items-center justify-center">
                <X className="w-5 h-5 text-status-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedExpenses.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-card">
              Pending
              {pendingExpenses.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">
                  {pendingExpenses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-card">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-card">
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <DataTable
              data={getActiveData()}
              columns={expenseColumns}
              searchKeys={["title", "requestedBy", "category"]}
              pageSize={20}
              emptyMessage="No expense requests found"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Expense Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>New Expense Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Title *
              </label>
              <Input
                placeholder="e.g., Kitchen supplies"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount (₦) *
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category *
              </label>
              {categoriesError ? (
                <CategoryLoadError onRetry={() => refetchCategories()} />
              ) : (
                <Select
                  value={newExpense.category}
                  onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue
                      placeholder={categoriesLoading ? "Loading…" : "Select category"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Provide details about this expense..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSubmitExpense}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedExpense && (
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="font-medium text-foreground">{selectedExpense.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(selectedExpense.amount)} • {selectedExpense.requestedBy}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reason for rejection *
              </label>
              <Textarea
                placeholder="Explain why this expense is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedExpense(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={handleReject}
            >
              Reject
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
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Expenses" />
    </div>
  );
};

export default ExpensesPage;