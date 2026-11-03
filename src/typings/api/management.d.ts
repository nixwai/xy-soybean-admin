declare namespace ApiManagement {
  interface PageQuery {
    page: number;
    pageSize: number;
  }

  interface PageResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  interface ListResponse<T> {
    items: T[];
    total: number;
  }

  interface IdRequest {
    id: string;
    currentPassword?: string;
  }

  interface Admin {
    id: string;
    username: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    roleIds: string[];
    createdAt: string;
    updatedAt: string;
  }

  interface AdminCreateRequest {
    username: string;
    password: string;
    isSuperAdmin?: boolean;
    currentPassword?: string;
  }

  interface AdminUpdateRequest {
    id: string;
    username?: string;
    password?: string;
    isActive?: boolean;
    isSuperAdmin?: boolean;
    currentPassword?: string;
  }

  interface AdminResetPasswordRequest {
    id: string;
    password: string;
    currentPassword: string;
  }

  interface AdminRoleBindingRequest {
    adminId: string;
    roleId: string;
  }

  interface Role {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    permissionIds: string[];
    deletedAt: string | null;
  }

  interface RoleCreateRequest {
    code: string;
    name: string;
    description?: string;
  }

  interface RoleUpdateRequest {
    id: string;
    name?: string;
    description?: string;
    isActive?: boolean;
  }

  interface RolePermissionBindingRequest {
    roleId: string;
    permissionId: string;
  }

  interface Permission {
    id: string;
    code: string;
    resource: string;
    method: string;
    name: string;
    description: string | null;
    isActive: boolean;
  }

  interface Menu {
    id: string;
    parentId: string | null;
    title: string;
    path: string;
    icon: string | null;
    order: number;
    permissionCode: string | null;
    isActive: boolean;
    deletedAt: string | null;
  }

  interface MenuCreateRequest {
    parentId?: string | null;
    title: string;
    path: string;
    icon?: string;
    order?: number;
    permissionCode?: string | null;
  }

  interface MenuUpdateRequest extends MenuCreateRequest {
    id: string;
    isActive?: boolean;
  }

  interface AuditLog {
    id: string;
    actorAdminId: string | null;
    action: string;
    resourceType: string;
    targetId: string | null;
    details: Record<string, unknown> | null;
    succeeded: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface AuditQuery {
    cursor?: string;
    limit: number;
  }

  interface AuditListResponse {
    items: AuditLog[];
    nextCursor: string | null;
    hasMore: boolean;
  }
}
