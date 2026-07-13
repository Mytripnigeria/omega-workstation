import { workstationApi } from "./api";

/**
 * A merchant-configured payment method, as surfaced to the workstation.
 * Mirrors the backend PaymentMethodResponseDto (subset used by the POS).
 */
export interface WorkstationPaymentMethod {
  id: string;
  type: "cash" | "card" | "transfer" | "pos" | "mobile_money" | "wallet" | "other";
  label: string;
  order: number;
  config?: Record<string, unknown> | null;
}

export const paymentMethodsService = {
  /**
   * Enabled payment methods the merchant has made visible on a workstation
   * channel (`pos` = Counter POS, `self` = Self-Service). Drives the payment
   * option buttons so they reflect Settings → Payment Methods instead of a
   * hardcoded Cash/Card pair.
   */
  listEnabled: (channel: "pos" | "self"): Promise<WorkstationPaymentMethod[]> =>
    workstationApi.request<WorkstationPaymentMethod[]>(
      `/payment-methods/enabled?channel=${channel}`,
    ),
};
