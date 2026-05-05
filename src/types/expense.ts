// Mirrors backend ExpenseResponseDto.
export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";

export type ExpenseCategory =
  | "supplies"
  | "utilities"
  | "maintenance"
  | "transport"
  | "salaries"
  | "other";

export interface Expense {
  id: string;
  businessId: string;
  storeId: string;
  requestedById: string;
  requestedByName: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
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

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  description: string;
  receiptFileId?: string;
}
