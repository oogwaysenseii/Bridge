import { ForbiddenError } from "../../errors/app-error";
import type { PermissionAction, PermissionActor, PermissionResource } from "./permission.types";

/**
 * Centralizes authorization decisions instead of scattering ad hoc
 * ownership checks across every module's service layer — see
 * docs/core-services.md §6. Modules pass their own resource data in; this
 * service never owns resource data itself, only the policy layered over
 * it.
 *
 * Phase 1 implements the two policies every module needs immediately:
 * ownership, and public/private/connections visibility. Role-based checks
 * (a future company-member "editor" role, a group "moderator" role) extend
 * `PermissionResource` and the switch in `evaluate()` when those modules
 * are built — a documented extension point, not a placeholder (per
 * Development Rule 8).
 */
export class PermissionService {
  /**
   * Returns whether `actor` may perform `action` on `resource`. Never
   * throws — callers that need a hard failure use `requirePermission`
   * below. Unauthenticated access is represented by `actor === null`.
   */
  public can(actor: PermissionActor | null, action: PermissionAction, resource: PermissionResource): boolean {
    if (this.isOwner(actor, resource)) {
      return true;
    }
    return this.evaluate(actor, action, resource);
  }

  /**
   * Same check as `can`, but throws ForbiddenError (mapped to HTTP 403 by
   * error-handler.middleware.ts) instead of returning false. This is the
   * method route handlers and services call on every write per api.md's
   * "Authorization on every write" convention.
   */
  public requirePermission(
    actor: PermissionActor | null,
    action: PermissionAction,
    resource: PermissionResource,
  ): void {
    if (!this.can(actor, action, resource)) {
      throw new ForbiddenError();
    }
  }

  private isOwner(actor: PermissionActor | null, resource: PermissionResource): boolean {
    return Boolean(actor && resource.ownerId && actor.id === resource.ownerId);
  }

  /**
   * Policy for non-owners. `read` is governed by visibility; every other
   * action defaults to denied for non-owners — modules must earn
   * additional permission explicitly (e.g. a future role check) rather
   * than this service defaulting to permissive.
   */
  private evaluate(actor: PermissionActor | null, action: PermissionAction, resource: PermissionResource): boolean {
    if (action !== "read") {
      return false;
    }
    return this.canRead(resource);
  }

  private canRead(resource: PermissionResource): boolean {
    switch (resource.visibility) {
      case "public":
      case undefined:
        return true;
      case "connections":
        // Phase 1 does not yet implement a "connections" relationship
        // check beyond `follows` (Phase 3 builds the follow graph).
        // Conservatively deny non-owner reads until that relationship can
        // actually be evaluated, rather than guessing permissive.
        return false;
      case "private":
        return false;
      default:
        // Every member of ResourceVisibility is covered above, so this is
        // unreachable today — but TypeScript's "all code paths must
        // return a value" check does not treat a switch as exhaustive
        // just because every current literal has a case; without a
        // `default`, it sees a path where no case matches and the
        // function falls through returning nothing, which conflicts with
        // the declared `boolean` return type. This default closes that
        // path explicitly, and fails closed (deny) rather than open — the
        // correct posture if `ResourceVisibility` is ever extended with a
        // new value and this switch isn't updated to match.
        return false;
    }
  }
}

export const permissionService = new PermissionService();
