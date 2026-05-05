import { workstationApi } from "./api";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseFilter,
} from "@/types/expense";
import type { PaginatedResponse } from "@/types/pagination";

function buildQueryString(filter: ExpenseFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const expensesService = {
  listMy: (filter: ExpenseFilter = {}): Promise<PaginatedResponse<Expense>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Expense>>(
      `/expenses/my${qs ? `?${qs}` : ""}`,
    );
  },

  list: (filter: ExpenseFilter = {}): Promise<PaginatedResponse<Expense>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Expense>>(
      `/expenses${qs ? `?${qs}` : ""}`,
    );
  },

  findOne: (id: string): Promise<Expense> =>
    workstationApi.request<Expense>(`/expenses/${id}`),

  create: (input: CreateExpenseInput): Promise<Expense> =>
    workstationApi.request<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remove: (id: string): Promise<void> =>
    workstationApi.request<void>(`/expenses/${id}`, { method: "DELETE" }),
};
