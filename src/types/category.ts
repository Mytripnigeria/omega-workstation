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
  /**
   * Channels the merchant enabled this category for (e.g. ["pos","storefront"]).
   * Empty/absent means every channel.
   */
  visibility?: string[] | null;
}
