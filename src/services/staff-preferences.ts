import { workstationApi } from "./api";

export type StaffTheme = "light" | "dark" | "system";

export interface StaffPreferences {
  beepEnabled: boolean;
  theme: StaffTheme;
  notificationsEnabled: boolean;
}

export interface UpdateStaffPreferencesPayload {
  beepEnabled?: boolean;
  theme?: StaffTheme;
  notificationsEnabled?: boolean;
}

export const staffPreferencesService = {
  get: (): Promise<StaffPreferences> =>
    workstationApi.request<StaffPreferences>("/staff/me/preferences"),

  update: (patch: UpdateStaffPreferencesPayload): Promise<StaffPreferences> =>
    workstationApi.request<StaffPreferences>("/staff/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  /** Change the staff member's own workstation login PIN. */
  changePin: (currentPin: string, newPin: string): Promise<void> =>
    workstationApi.request<void>("/staff/me/pin", {
      method: "PATCH",
      body: JSON.stringify({ currentPin, newPin }),
    }),
};
