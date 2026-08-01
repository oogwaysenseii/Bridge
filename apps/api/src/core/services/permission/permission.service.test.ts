import { describe, it, expect } from "vitest";
import { PermissionService } from "./permission.service";
import { ForbiddenError } from "../../errors/app-error";
import type { PermissionActor, PermissionResource } from "./permission.types";

const owner: PermissionActor = { id: "owner-1" };
const stranger: PermissionActor = { id: "stranger-1" };

describe("PermissionService", () => {
  const service = new PermissionService();

  describe("ownership", () => {
    it("allows the owner to read their own resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "private" };
      expect(service.can(owner, "read", resource)).toBe(true);
    });

    it("allows the owner to update their own resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id };
      expect(service.can(owner, "update", resource)).toBe(true);
    });

    it("allows the owner to delete their own resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id };
      expect(service.can(owner, "delete", resource)).toBe(true);
    });

    it("denies a non-owner from updating someone else's resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(service.can(stranger, "update", resource)).toBe(false);
    });

    it("denies a non-owner from deleting someone else's resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(service.can(stranger, "delete", resource)).toBe(false);
    });

    it("denies a non-owner from moderating someone else's resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(service.can(stranger, "moderate", resource)).toBe(false);
    });
  });

  describe("read visibility policy", () => {
    it("allows anyone to read a public resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(service.can(stranger, "read", resource)).toBe(true);
    });

    it("allows anyone to read a resource with no visibility set (defaults to public)", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id };
      expect(service.can(stranger, "read", resource)).toBe(true);
    });

    it("denies reading a private resource for a non-owner", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "private" };
      expect(service.can(stranger, "read", resource)).toBe(false);
    });

    it("denies reading a connections-only resource for a non-owner (no connection graph implemented yet)", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "connections" };
      expect(service.can(stranger, "read", resource)).toBe(false);
    });

    it("allows an unauthenticated actor (null) to read a public resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(service.can(null, "read", resource)).toBe(true);
    });

    it("denies an unauthenticated actor (null) from reading a private resource", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "private" };
      expect(service.can(null, "read", resource)).toBe(false);
    });
  });

  describe("resources with no owner (e.g. platform-level resources)", () => {
    it("falls through to the read/visibility policy when ownerId is not set", () => {
      const resource: PermissionResource = { type: "listing-category", visibility: "public" };
      expect(service.can(stranger, "read", resource)).toBe(true);
    });

    it("denies non-read actions when there is no owner to match against", () => {
      const resource: PermissionResource = { type: "listing-category", visibility: "public" };
      expect(service.can(stranger, "update", resource)).toBe(false);
    });
  });

  describe("requirePermission", () => {
    it("does not throw when the action is permitted", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "public" };
      expect(() => {
        service.requirePermission(owner, "update", resource);
      }).not.toThrow();
    });

    it("throws ForbiddenError when the action is not permitted", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id, visibility: "private" };
      expect(() => {
        service.requirePermission(stranger, "read", resource);
      }).toThrow(ForbiddenError);
    });

    it("throws ForbiddenError (not a generic Error) so the error-handler middleware maps it to HTTP 403", () => {
      const resource: PermissionResource = { type: "post", ownerId: owner.id };
      try {
        service.requirePermission(stranger, "delete", resource);
        expect.fail("Expected requirePermission to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect((err as ForbiddenError).httpStatus).toBe(403);
      }
    });
  });
});
