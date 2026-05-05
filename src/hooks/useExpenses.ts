import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses";
import type { CreateExpenseInput, ExpenseFilter } from "@/types/expense";

export function useMyExpenses(filter: ExpenseFilter = {}) {
  return useQuery({
    queryKey: ["expenses", "my", filter],
    queryFn: () => expensesService.listMy(filter),
    staleTime: 30 * 1000,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => expensesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
