// Mirrors backend IngredientMovementResponseDto.
export type MovementType =
  | "intake"
  | "consumption"
  | "waste"
  | "transfer"
  | "correction";

export interface IngredientMovement {
  id: string;
  ingredientId: string;
  storeId: string;
  staffId: string | null;
  staffName: string | null;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  /** Sending / receiving location names (set for `transfer` movements). */
  fromLocationName: string | null;
  toLocationName: string | null;
  ingredientName: string | null;
  ingredientUnit: string | null;
  createdAt: string;
}

export interface MovementFilter {
  storeId?: string;
  ingredientId?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
