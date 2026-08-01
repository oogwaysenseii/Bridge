/**
 * A minimal cache contract. Services depend on this interface, not on
 * ioredis directly — this is what makes IdentityServiceImpl testable
 * without a real Redis connection (see identity.service.test.ts), and is
 * the same "constructor-injected dependency" pattern used for repositories
 * throughout the codebase (see docs/architecture.md §3, "dependency
 * injection where appropriate" — lightweight, not a DI framework).
 */
export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}
