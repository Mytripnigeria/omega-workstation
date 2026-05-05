// Mirrors backend IngredientResponseDto.
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplierId: string | null;
  sku: string | null;
  storeId: string;
  lastRestocked: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientFilter {
  storeId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}
