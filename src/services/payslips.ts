import { workstationApi } from './api';
import type { Payslip } from '@/types/payslip';
import type { PaginatedResponse } from '@/types/pagination';

export interface PayslipFilter {
  status?: string;
  period?: string;
  periodFrom?: string;
  periodTo?: string;
  page?: number;
  limit?: number;
}

function buildQueryString(filter: PayslipFilter): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export const payslipsService = {
  myPayslips: (filter: PayslipFilter = {}): Promise<PaginatedResponse<Payslip>> => {
    const qs = buildQueryString(filter);
    return workstationApi.request<PaginatedResponse<Payslip>>(`/payslips/my${qs ? `?${qs}` : ''}`);
  },
};
