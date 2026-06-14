import { useQuery } from "@tanstack/react-query";
import { workstationApi } from "@/services/api";

export interface ReceiptInfo {
  storeName: string | null;
  address: string | null;
  phone: string | null;
  receiptHeader: string | null;
  receiptFooter: string | null;
  showServerName: boolean;
}

/** Store/business receipt details for the POS receipt (header/footer/address). */
export function useReceiptInfo() {
  return useQuery({
    queryKey: ["receipt-info"],
    queryFn: () => workstationApi.request<ReceiptInfo>("/workstation/receipt-info"),
    staleTime: 5 * 60 * 1000,
  });
}
