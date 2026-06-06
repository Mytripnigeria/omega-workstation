import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tablesService, type TableFilter, type TableStatus } from "@/services/tables";

export function useTables(filter: TableFilter = {}) {
  return useQuery({
    queryKey: ["tables", filter],
    queryFn: () => tablesService.list(filter),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!filter.storeId,
  });
}

export function useUpdateTableStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tablesService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}
