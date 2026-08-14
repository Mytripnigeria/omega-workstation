import { workstationApi } from "./api";

export interface CashSession {
  id: string;
  businessId: string;
  storeId: string;
  staffId: string;
  staffName: string;
  counterName: string | null;
  staffsJoined: string[] | null;
  status: "open" | "closed" | "reviewed";
  openedAt: string;
  closedAt: string | null;
  openingFloat: number;
  expectedCash: number;
  expectedCard: number;
  expectedMobile: number;
  expectedTotal: number;
  actualCash: number;
  actualCard: number;
  actualMobile: number;
  actualTotal: number;
  difference: number;
}

export interface OpenCashSessionInput {
  openingFloat: number;
  counterName?: string;
  shiftId?: string;
  notes?: string;
}

export interface CloseCashSessionInput {
  /** Counted cash in the drawer (including opening float). Omit to accept expected. */
  actualCash?: number;
  actualCard?: number;
  actualMobile?: number;
  notes?: string;
}

/** Live expected totals for an OPEN session, from the order ledger. */
export interface CashSessionExpected {
  expectedCash: number;
  expectedCard: number;
  expectedMobile: number;
  expectedTotal: number;
}

export interface CashSessionPage {
  data: CashSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const cashSessionsService = {
  /**
   * Register history for the staff member's own store (the backend scopes a
   * staff token to its store). Read-only — used by the Managers board.
   */
  list: (params: { status?: string; limit?: number } = {}): Promise<CashSessionPage> => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    qs.set("limit", String(params.limit ?? 50));
    return workstationApi.request<CashSessionPage>(`/cash-sessions?${qs.toString()}`);
  },

  myActive: (): Promise<CashSession | null> =>
    workstationApi.request<CashSession | null>("/cash-sessions/me/active"),

  /** Open registers on my store I can join (excludes ones I already belong to). */
  storeActive: (): Promise<CashSession[]> =>
    workstationApi.request<CashSession[]>("/cash-sessions/store-active"),

  join: (id: string): Promise<CashSession> =>
    workstationApi.request<CashSession>(`/cash-sessions/${id}/join`, {
      method: "POST",
    }),

  open: (input: OpenCashSessionInput): Promise<CashSession> =>
    workstationApi.request<CashSession>("/cash-sessions/open", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** What the register should hold right now (per tender), for the close screen. */
  expected: (id: string): Promise<CashSessionExpected> =>
    workstationApi.request<CashSessionExpected>(
      `/cash-sessions/${id}/expected`,
    ),

  close: (id: string, input: CloseCashSessionInput): Promise<CashSession> =>
    workstationApi.request<CashSession>(`/cash-sessions/${id}/close`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
