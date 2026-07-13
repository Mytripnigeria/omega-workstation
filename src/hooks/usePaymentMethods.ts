import { useQuery } from "@tanstack/react-query";
import { paymentMethodsService } from "@/services/payment-methods";

/**
 * Loads the merchant's enabled payment methods for a workstation channel.
 * Used by the POS / Self-Service screens to render payment options from
 * merchant settings.
 */
export function useEnabledPaymentMethods(channel: "pos" | "self") {
  return useQuery({
    queryKey: ["payment-methods", "enabled", channel],
    queryFn: () => paymentMethodsService.listEnabled(channel),
    staleTime: 5 * 60 * 1000,
  });
}
