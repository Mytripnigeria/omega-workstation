export type CategoryType = 'menu' | 'inventory' | 'expense' | 'equipment';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  emoji?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}
