import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ingredientsService } from "@/services/ingredients";
import type { MovementFilter } from "@/types/movement";

export function useMovements(filter: MovementFilter = {}) {
  return useQuery({
    queryKey: ["ingredient-movements", filter],
    queryFn: () => ingredientsService.listMovements(filter),
    staleTime: 30 * 1000,
  });
}

export function useMovementsForIngredient(
  ingredientId: string | undefined,
  filter: MovementFilter = {},
) {
  return useQuery({
    queryKey: ["ingredient-movements", ingredientId, filter],
    queryFn: () =>
      ingredientsService.listMovementsForIngredient(ingredientId!, filter),
    enabled: !!ingredientId,
    staleTime: 30 * 1000,
  });
}

export function useTransferStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromId,
      toIngredientId,
      quantity,
      reason,
    }: {
      fromId: string;
      toIngredientId: string;
      quantity: number;
      reason?: string;
    }) =>
      ingredientsService.transfer(fromId, toIngredientId, quantity, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingredients"] });
      qc.invalidateQueries({ queryKey: ["ingredient-movements"] });
    },
  });
}
