// Mirrors backend IngredientLocationStockResponseDto.
export interface IngredientLocationStock {
  id: string;
  locationId: string;
  currentStock: number;
  minStock: number;
  lastRestocked: string | null;
  expiryDate: string | null;
}

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
  /** Best-before / use-by date for the current batch (YYYY-MM-DD), or null. */
  expiryDate: string | null;
  /** Per-location stock entries (aggregate currentStock is summed across these). */
  locations?: IngredientLocationStock[];
  createdAt: string;
  updatedAt: string;
}

export interface IngredientFilter {
  storeId?: string;
  search?: string;
  status?: string;
  /** Filter to ingredients stocked at this inventory location. */
  locationId?: string;
  page?: number;
  limit?: number;
}
