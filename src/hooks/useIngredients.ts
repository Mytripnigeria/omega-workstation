import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ingredientsService } from '@/services/ingredients';
import type { IngredientFilter } from '@/types/ingredient';

export function useIngredients(
  filter: IngredientFilter = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['ingredients', filter],
    queryFn: () => ingredientsService.list(filter),
    staleTime: 60 * 1000,
    enabled: options.enabled ?? true,
  });
}

export function useLowStockIngredients(storeId?: string) {
  return useIngredients({ storeId, status: 'low', limit: 50 });
}

/**
 * Lists ingredients whose best-before date is within `days` (default 14).
 * Powers the workstation Inventory Alerts "Expiring Soon" card.
 */
export function useExpiringIngredients(storeId?: string, days = 14) {
  return useQuery({
    queryKey: ['ingredients', 'expiring', storeId, days],
    queryFn: () => ingredientsService.listExpiring(storeId, days),
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
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
    mutationFn: ({
      id,
      adjustment,
      reason,
      expiryDate,
      type,
      locationId,
    }: {
      id: string;
      adjustment: number;
      reason?: string;
      expiryDate?: string;
      type?: 'intake' | 'consumption' | 'waste' | 'transfer' | 'correction';
      locationId?: string;
    }) =>
      ingredientsService.adjustStock(
        id,
        adjustment,
        reason,
        expiryDate,
        type,
        locationId,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}
