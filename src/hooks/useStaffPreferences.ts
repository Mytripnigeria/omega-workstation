import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  staffPreferencesService,
  type StaffPreferences,
  type UpdateStaffPreferencesPayload,
} from "@/services/staff-preferences";
import { workstationAuth } from "@/services/api";

const STORAGE_KEY = "workstation_preferences";

const DEFAULTS: StaffPreferences = {
  beepEnabled: true,
  theme: "system",
  notificationsEnabled: true,
};

/**
 * Module-level cache so non-React-Query consumers (e.g. {@link useBeepSound})
 * can read the user's preferences without an async fetch. The Settings page
 * keeps this cache in sync via `setCached`; if we ever boot before the network
 * settles we fall back to localStorage, then defaults.
 */
function readCachedFromStorage(): StaffPreferences {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<StaffPreferences>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

let cached: StaffPreferences = readCachedFromStorage();
const listeners = new Set<() => void>();

function setCached(next: StaffPreferences) {
  cached = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
    } catch {
      // Storage quota / disabled — module cache still works for this session.
    }
  }
  listeners.forEach((cb) => cb());
}

/** Synchronous reader for non-React-Query call sites (audio, haptics, polling). */
export function getCachedStaffPreference<K extends keyof StaffPreferences>(
  key: K,
): StaffPreferences[K] {
  return cached[key];
}

/** Subscribe to cache changes from outside React (rare). */
export function subscribeStaffPreferences(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStaffPreferences() {
  const enabled = workstationAuth.isAuthenticated();
  const query = useQuery<StaffPreferences>({
    queryKey: ["staff", "me", "preferences"],
    queryFn: () => staffPreferencesService.get(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  // Keep the synchronous cache in sync with the latest server payload.
  useEffect(() => {
    if (query.data) setCached(query.data);
  }, [query.data]);

  return query;
}

export function useUpdateStaffPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateStaffPreferencesPayload) =>
      staffPreferencesService.update(patch),
    onSuccess: (next) => {
      setCached(next);
      qc.setQueryData(["staff", "me", "preferences"], next);
    },
  });
}

/**
 * Reactive accessor for a single preference key — components re-render when
 * any other component (typically Settings) updates the cache.
 */
export function useStaffPreference<K extends keyof StaffPreferences>(
  key: K,
): StaffPreferences[K] {
  const [value, setValue] = useState<StaffPreferences[K]>(cached[key]);
  useEffect(() => {
    const cb = () => setValue(cached[key]);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, [key]);
  return value;
}
