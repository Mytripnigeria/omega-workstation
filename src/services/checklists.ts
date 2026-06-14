import { workstationApi } from "./api";
import type { PaginatedResponse } from "@/types/pagination";

export interface ChecklistItemDto {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedByName?: string | null;
  order: number;
}

export interface ChecklistDto {
  id: string;
  name: string;
  description?: string | null;
  assignmentType: "all_staff" | "role" | "staff";
  status: string;
  items: ChecklistItemDto[];
}

export const checklistsService = {
  /**
   * Checklists assigned to the current staff — the backend returns those
   * attached individually, via their role, or to all staff in their store.
   */
  listMine: (): Promise<PaginatedResponse<ChecklistDto>> =>
    workstationApi.request<PaginatedResponse<ChecklistDto>>(
      `/checklists?limit=100`,
    ),

  toggleItem: (
    checklistId: string,
    itemId: string,
    isCompleted: boolean,
  ): Promise<ChecklistDto> =>
    workstationApi.request<ChecklistDto>(
      `/checklists/${checklistId}/items/${itemId}`,
      { method: "PATCH", body: JSON.stringify({ isCompleted }) },
    ),
};
