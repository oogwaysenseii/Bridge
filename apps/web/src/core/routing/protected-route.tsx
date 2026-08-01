import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/core/auth/auth-client";

/**
 * The protected-route pattern called for in architecture.md §7.8. Every
 * future authenticated page (feed, marketplace, chat, ...) nests under a
 * route using this component rather than each page re-implementing its own
 * auth check — see docs/roadmap.md, this is deliberately built now even
 * though Phase 1 only has one protected page (the dashboard).
 *
 * While the session is loading, we render nothing rather than flashing a
 * redirect-then-back — `isPending` distinguishes "don't know yet" from
 * "confirmed logged out".
 */
export function ProtectedRoute(): React.JSX.Element | null {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
