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

/** Manager only (Managers overview). */
export function isManagerRole(): boolean {
  const staff = workstationAuth.getStaff();
  if (!staff) return false;
  const role = (staff.roleName ?? "").toLowerCase();
  return role.includes("manager") || (staff.permissions ?? []).includes("manage_store");
}
