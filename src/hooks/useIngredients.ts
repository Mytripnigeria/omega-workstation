import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ingredientsService } from '@/services/ingredients';
import type { IngredientFilter } from '@/types/ingredient';

export function useIngredients(filter: IngredientFilter = {}) {
  return useQuery({
    queryKey: ['ingredients', filter],
    queryFn: () => ingredientsService.list(filter),
    staleTime: 60 * 1000,
  });
}

export function useLowStockIngredients(storeId?: string) {
  return useIngredients({ storeId, status: 'low', limit: 50 });
}

export function useIngredient(id: string | undefined) {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => ingredientsService.findOne(id!),
    enabled: !!id,
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adjustment, reason }: { id: string; adjustment: number; reason?: string }) =>
      ingredientsService.adjustStock(id, adjustment, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}
