import { workstationApi, workstationAuth, type WorkstationStaff } from './api';

export interface StaffLookupResult {
  id: string;
  firstName: string;
  lastName: string;
  roleName: string;
  avatar?: string;
}

export const staffAuthService = {
  async lookup(staffCode: string): Promise<StaffLookupResult> {
    return workstationApi.request<StaffLookupResult>('/auth/staff/lookup', {
      method: 'POST',
      body: JSON.stringify({ staffCode }),
    });
  },

  async login(staffCode: string, pin: string): Promise<WorkstationStaff> {
    const result = await workstationApi.request<{
      accessToken: string;
      staff: WorkstationStaff;
    }>('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify({ staffCode, pin }),
    });

    workstationAuth.setSession(result.accessToken, result.staff);
    return result.staff;
  },

  logout(): void {
    workstationAuth.clear();
  },
};
