import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { equipmentService } from "@/services/equipment";

const KEY_STATUS = (storeId?: string) => ["equipment", "temperature", "status", storeId];
const KEY_MONITORED = (storeId?: string) => ["equipment", "monitored", storeId];

/**
 * Latest temperature reading per monitored equipment item for the staff's store.
 * Refreshes every 5 minutes; the workstation Inventory Alerts card reads this
 * to colour the Temperature Monitor metrics.
 */
export function useEquipmentTemperatureStatus(storeId?: string) {
  return useQuery({
    queryKey: KEY_STATUS(storeId),
    queryFn: () => equipmentService.temperatureStatus(storeId),
    enabled: !!storeId,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

/** Equipment items with a configured temperature range — used by the "Log reading" picker. */
export function useMonitoredEquipment(storeId?: string) {
  return useQuery({
    queryKey: KEY_MONITORED(storeId),
    queryFn: () => equipmentService.listMonitored(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogTemperatureReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      equipmentId,
      temperatureC,
      note,
    }: {
      equipmentId: string;
      temperatureC: number;
      note?: string;
    }) => equipmentService.logReading(equipmentId, temperatureC, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment", "temperature", "status"] });
      qc.invalidateQueries({ queryKey: ["equipment", "monitored"] });
    },
  });
}
