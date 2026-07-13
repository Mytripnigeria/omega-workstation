import { useQuery } from "@tanstack/react-query";
import { workstationApi } from "@/services/api";

export interface FunctionAccessResponse {
  /**
   * Merchant-configured role restrictions per workstation function
   * (counter_pos, self_service, kitchen, waiter, delivery, lobby, instore,
   * outstore, expenses, managers). A non-empty list = only those roles may
   * enter; absent/empty = the page's built-in default applies.
   */
  functionRoleAccess: Record<string, string[]> | null;
}

/** Per-function role access map from merchant Workstation Settings. */
export function useFunctionAccess() {
  return useQuery({
    queryKey: ["function-access"],
    queryFn: () =>
      workstationApi.request<FunctionAccessResponse>(
        "/workstation/function-access",
      ),
    staleTime: 5 * 60 * 1000,
  });
}
