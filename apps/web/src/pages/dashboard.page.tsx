import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProfileSummary } from "@bridge/shared";
import { apiClient } from "@/core/api/rpc-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Mirrors apps/api/src/core/api/router.ts's GET /v1/me response shape.
 * The Hono RPC client (see rpc-client.ts) already infers this type from
 * the server route via ADR-007 — this local interface exists to give
 * `fetchMe` an explicit, checkable return type. No cast is needed inside
 * the function body: `response.json()`'s inferred type is already
 * structurally identical to this interface.
 */
interface MeResponse {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    status: "active" | "suspended" | "deactivated";
  };
  profile: ProfileSummary | null;
}

async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.api.v1.me.$get();
  if (!response.ok) {
    throw new Error("Failed to load your account.");
  }
  const body = await response.json();
  return body;
}

export function DashboardPage(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  return (
    <div className="container flex flex-col gap-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      {isLoading && <p className="text-muted-foreground">Loading your account…</p>}

      {isError && (
        <p className="text-destructive" role="alert">
          Couldn&apos;t load your account. Try refreshing the page.
        </p>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>{data.user.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {data.user.emailVerified ? "Email verified." : "Email not yet verified — check your inbox."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                {data.profile ? data.profile.displayName : "No profile yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {data.profile
                ? `@${data.profile.username}`
                : // Emptiness is an invitation to act, not just a null state —
                  // per frontend-design skill. Profile creation is Phase 2 scope,
                  // so this is deliberately a message, not a broken feature.
                  "Profile creation is coming in the next phase of Bridge."}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
