import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistsService } from "@/services/checklists";

export function useMyChecklists(enabled = true) {
  return useQuery({
    queryKey: ["checklists", "mine"],
    queryFn: () => checklistsService.listMine(),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      itemId,
      isCompleted,
    }: {
      checklistId: string;
      itemId: string;
      isCompleted: boolean;
    }) => checklistsService.toggleItem(checklistId, itemId, isCompleted),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}
