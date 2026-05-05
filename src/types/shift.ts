// Mirrors backend ShiftResponseDto.
export type ShiftStatus = 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled';

export interface Shift {
  id: string;
  storeId: string;
  staffId: string;
  staffName: string;
  roleId: string | null;
  roleName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number | null;
  status: ShiftStatus;
  actualClockIn: string | null;
  actualClockOut: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftFilter {
  storeId?: string;
  staffId?: string;
  roleId?: string;
  status?: ShiftStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
