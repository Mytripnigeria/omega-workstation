// Mirrors backend ExpenseResponseDto.
export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";

export type ExpenseCategory =
  | "supplies"
  | "utilities"
  | "maintenance"
  | "transport"
  | "salaries"
  | "other";

/** `purchase` = stock bought in; `expense` = money spent. */
export type ExpenseItemType = "purchase" | "expense";

export interface ExpenseItem {
  name: string;
  type: ExpenseItemType;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  /** quantity × unitPrice, computed server-side. */
  total: number;
  supplier: string | null;
}

export interface Expense {
  id: string;
  businessId: string;
  storeId: string;
  requestedById: string;
  requestedByName: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string | null;
  /** Line items making up the submission; null for legacy free-text ones. */
  items: ExpenseItem[] | null;
  supplierName: string | null;
  receiptFileId: string | null;
  receiptUrl: string | null;
  status: ExpenseStatus;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  paidAt: string | null;
  paymentMethodId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  storeId?: string;
  requestedById?: string;
  status?: string; // CSV
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** One line of a submission, as posted. `total` is computed server-side. */
export interface CreateExpenseItemInput {
  name: string;
  type: ExpenseItemType;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  supplier?: string | null;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  /** Ignored when `items` are supplied — the total is summed from them. */
  amount?: number;
  currency?: string;
  description?: string;
  items?: CreateExpenseItemInput[];
  supplierName?: string;
  receiptFileId?: string;
}
