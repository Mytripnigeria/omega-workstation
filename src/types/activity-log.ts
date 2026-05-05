// Mirrors backend ActivityLogResponseDto.
export type ActorType = 'admin' | 'staff' | 'system';

export interface ActivityEntry {
  id: string;
  actorType: ActorType;
  actorId: string | null;
  actorName: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  businessId: string;
  storeId: string | null;
  createdAt: string;
}

export interface ActivityLogFilter {
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  actorType?: ActorType;
  action?: string;
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
