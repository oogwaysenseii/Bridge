import { createAuthClient } from "better-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Points at the API's Better Auth handler mounted at /api/auth/* (see
 * apps/api/src/index.ts). `credentials: "include"` is required so the
 * session cookie Better Auth sets is sent on cross-origin requests between
 * the Next dev server and the API during local development.
 */
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
