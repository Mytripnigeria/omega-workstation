// Mirrors backend DeliveryResponseDto.
export type DeliveryStatus =
  | "awaiting_dispatch"
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "failed";

export interface DeliveryOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  variation: { name?: string } | null;
  addons: Array<{ name?: string; price?: number }> | null;
  notes: string | null;
}

export interface Delivery {
  id: string;
  orderId: string;
  businessId: string;
  storeId: string;
  riderStaffId: string | null;
  riderName: string | null;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: DeliveryStatus;
  dispatchedAt: string | null;
  dispatchedByName: string | null;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  notes: string | null;
  orderNumber: number | null;
  customerName: string | null;
  items: DeliveryOrderItem[];
  orderTotal: number | null;
  orderStatus: string | null;
  orderNotes: string | null;
  paymentChannel: string | null;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryFilter {
  storeId?: string;
  riderStaffId?: string;
  status?: string; // CSV
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateDeliveryInput {
  orderId: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}
