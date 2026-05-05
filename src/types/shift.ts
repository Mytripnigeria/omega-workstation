// Mirrors backend ShiftResponseDto.
export type ShiftStatus = 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  completedAt?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

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
  checklist: ChecklistCategory[] | null;
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
