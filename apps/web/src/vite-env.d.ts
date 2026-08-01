/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Not guaranteed to be set — Vite reflects whatever's actually in the
   * environment, it doesn't enforce that a declared var exists. Both
   * consumers (rpc-client.ts, auth-client.ts) fall back to a local dev
   * default via `??`; typing this as a bare `string` would make that
   * fallback look unreachable to the type checker when it's actually
   * necessary runtime protection.
   */
  readonly VITE_API_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
