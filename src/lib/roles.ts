import { workstationAuth } from "@/services/api";

/** Manager OR supervisor (store-room screens, expenses). */
export function canManageOrSupervise(): boolean {
  const staff = workstationAuth.getStaff();
  if (!staff) return false;
  const role = (staff.roleName ?? "").toLowerCase();
  if (role.includes("manager") || role.includes("supervisor")) return true;
  return (staff.permissions ?? []).some((p) =>
    ["manage_inventory", "manage_orders", "manage_store"].includes(p),
  );
}

/**
 * Merchant-configured per-function access (Workstation Settings →
 * functionRoleAccess). A non-empty role list for `functionKey` means ONLY
 * staff whose role name is in the list may enter; absent/empty falls back to
 * `fallback` (the page's built-in gate, `true` for ungated pages). Pass
 * `undefined` for the map while it is still loading to fail open.
 */
export function canAccessFunction(
  map: Record<string, string[]> | null | undefined,
  functionKey: string,
  fallback = true,
): boolean {
  const staff = workstationAuth.getStaff();
  if (!staff) return false;
  const list = map?.[functionKey];
  if (!list || list.length === 0) return fallback;
  const role = (staff.roleName ?? "").trim().toLowerCase();
  return list.some((r) => r.trim().toLowerCase() === role);
}

/** Manager only (Managers overview). */
export function isManagerRole(): boolean {
  const staff = workstationAuth.getStaff();
  if (!staff) return false;
  const role = (staff.roleName ?? "").toLowerCase();
  return role.includes("manager") || (staff.permissions ?? []).includes("manage_store");
}
