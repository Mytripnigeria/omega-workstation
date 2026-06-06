import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { workstationAuth } from "@/services/api";
import { useStaffPreferences } from "@/hooks/useStaffPreferences";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards protected screens by checking the staff session. If no valid token is
 * present, the user is redirected to the login screen. The API client (`api.ts`)
 * also handles 401s mid-session, but this guard catches navigations made before
 * any request fires (e.g. typing a URL directly, returning to a stale tab).
 *
 * As a side effect this also primes the per-staff preferences cache (one
 * dedupe'd React Query fetch per session) so {@link useBeepSound} and friends
 * can read prefs synchronously throughout the app.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const authed = workstationAuth.isAuthenticated();
  // Fire the prefs query whenever a protected route is mounted; the hook
  // self-guards on `isAuthenticated()` and React Query dedupes by key.
  useStaffPreferences();
  if (!authed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
