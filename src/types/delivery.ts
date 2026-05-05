// Mirrors backend DeliveryResponseDto.
export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "failed";

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
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  notes: string | null;
  orderNumber: number | null;
  customerName: string | null;
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
