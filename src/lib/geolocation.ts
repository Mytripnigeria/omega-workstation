export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Best-effort current device coordinates for geofenced login / clock-in.
 * Resolves to null (never rejects) when geolocation is unavailable, denied, or
 * times out — the backend only enforces the geofence when the merchant has it
 * enabled, and returns a clear error if coordinates are then missing.
 */
export async function getCurrentCoords(timeoutMs = 8000): Promise<Coords | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
