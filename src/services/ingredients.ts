import { workstationApi } from './api';
import type { Ingredient, IngredientFilter } from '@/types/ingredient';
import type { PaginatedResponse } from '@/types/pagination';

function buildQueryString(filter: IngredientFilter): string {
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
    const qs = buildQueryString(filter);
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
};
