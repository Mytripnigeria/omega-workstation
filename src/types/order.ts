// Mirrors backend OrderResponseDto.
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type OrderChannel = "pos" | "website" | "phone";
export type PrepStatus = "pending" | "preparing" | "ready";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  comboId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variation: Record<string, unknown> | null;
  addons: Record<string, unknown>[] | null;
  notes: string | null;
  prepStatus: PrepStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  businessId: string;
  storeId: string;
  staffId: string | null;
  staffName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  tableNumber: string | null;
  channel: OrderChannel;
  isDelivery: boolean;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  paymentMethodId: string | null;
  paidAt: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilter {
  storeId?: string;
  staffId?: string;
  status?: string; // CSV
  channel?: OrderChannel;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderItemInput {
  productId?: string;
  comboId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variation?: Record<string, unknown>;
  addons?: Record<string, unknown>[];
  notes?: string;
}

export interface CreateOrderInput {
  channel?: OrderChannel;
  isDelivery?: boolean;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  notes?: string;
  discountAmount?: number;
  taxAmount?: number;
  items: CreateOrderItemInput[];
}

export interface OrderStats {
  todayCount: number;
  todayRevenue: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
}
