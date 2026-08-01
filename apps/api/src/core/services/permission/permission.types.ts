export type PermissionAction = "read" | "update" | "delete" | "moderate";

export type ResourceVisibility = "public" | "connections" | "private";

/**
 * Deliberately generic: the Permission Service never owns resource data
 * (see docs/core-services.md §6), so modules pass in whatever subset of
 * this shape is relevant to their resource. `ownerId` and `visibility`
 * cover every policy Phase 1 needs; role-based fields (e.g. a future
 * company-member role) extend this interface when that module is built —
 * an explicit, documented extension point rather than a placeholder.
 */
export interface PermissionResource {
  type: string;
  ownerId?: string;
  visibility?: ResourceVisibility;
}

export interface PermissionActor {
  id: string;
}
