import { workstationApi } from './api';
import type { Ingredient, IngredientFilter } from '@/types/ingredient';
import type { IngredientMovement, MovementFilter } from '@/types/movement';
import type { PaginatedResponse } from '@/types/pagination';

function buildQueryString(filter: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const ingredientsService = {
  list: (filter: IngredientFilter = {}): Promise<PaginatedResponse<Ingredient>> => {
    const qs = buildQueryString(filter as Record<string, unknown>);
    return workstationApi.request<PaginatedResponse<Ingredient>>(
      `/ingredients${qs ? `?${qs}` : ''}`,
    );
  },

  findOne: (id: string): Promise<Ingredient> =>
    workstationApi.request<Ingredient>(`/ingredients/${id}`),

  adjustStock: (id: string, adjustment: number, reason?: string): Promise<Ingredient> =>
    workstationApi.request<Ingredient>(`/ingredients/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ adjustment, reason }),
    }),

  transfer: (
    fromId: string,
    toIngredientId: string,
    quantity: number,
    reason?: string,
  ): Promise<{ from: Ingredient; to: Ingredient }> =>
    workstationApi.request<{ from: Ingredient; to: Ingredient }>(
      `/ingredients/${fromId}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify({ toIngredientId, quantity, reason }),
      },
    ),

  listMovements: (filter: MovementFilter = {}): Promise<PaginatedResponse<IngredientMovement>> => {
    const qs = buildQueryString(filter as Record<string, unknown>);
    return workstationApi.request<PaginatedResponse<IngredientMovement>>(
      `/ingredients/movements${qs ? `?${qs}` : ''}`,
    );
  },

  listMovementsForIngredient: (
    id: string,
    filter: MovementFilter = {},
  ): Promise<PaginatedResponse<IngredientMovement>> => {
    const qs = buildQueryString(filter as Record<string, unknown>);
    return workstationApi.request<PaginatedResponse<IngredientMovement>>(
      `/ingredients/${id}/movements${qs ? `?${qs}` : ''}`,
    );
  },
};
