import { workstationApi } from "./api";

export interface EquipmentTemperatureStatus {
  equipmentId: string;
  name: string;
  minTempC: number | null;
  maxTempC: number | null;
  currentTemperature: number | null;
  lastReadingAt: string | null;
  state: "ok" | "out_of_range" | "stale" | "unmeasured";
}

export interface EquipmentTemperatureReading {
  id: string;
  equipmentId: string;
  storeId: string;
  temperatureC: number;
  isInRange: boolean;
  recordedById: string | null;
  recordedByName: string | null;
  note: string | null;
  recordedAt: string;
}

/** Slim representation used by the workstation reading-logger picker. */
export interface EquipmentForReading {
  id: string;
  name: string;
  storeId: string;
  category: string;
  minTempC: number | null;
  maxTempC: number | null;
  currentTemperature: number | null;
}

export const equipmentService = {
  /** Latest reading + state per monitored equipment item. */
  temperatureStatus: (storeId?: string): Promise<EquipmentTemperatureStatus[]> => {
    const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
    return workstationApi.request<EquipmentTemperatureStatus[]>(
      `/equipment/temperature/status${qs}`,
    );
  },

  /** Append a reading to an equipment item. */
  logReading: (
    equipmentId: string,
    temperatureC: number,
    note?: string,
  ): Promise<EquipmentTemperatureReading> =>
    workstationApi.request<EquipmentTemperatureReading>(
      `/equipment/${equipmentId}/temperature-readings`,
      { method: "POST", body: JSON.stringify({ temperatureC, note }) },
    ),

  /** Lists equipment with at least min/max range configured (for the picker). */
  listMonitored: async (storeId: string): Promise<EquipmentForReading[]> => {
    // The status endpoint already returns one row per monitored equipment item.
    const rows = await workstationApi.request<EquipmentTemperatureStatus[]>(
      `/equipment/temperature/status?storeId=${encodeURIComponent(storeId)}`,
    );
    return rows
      .filter((r) => r.minTempC != null || r.maxTempC != null)
      .map((r) => ({
        id: r.equipmentId,
        name: r.name,
        storeId,
        category: "",
        minTempC: r.minTempC,
        maxTempC: r.maxTempC,
        currentTemperature: r.currentTemperature,
      }));
  },
};
