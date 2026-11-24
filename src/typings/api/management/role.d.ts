declare namespace ApiManagement {
  interface Role {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    isSystem: boolean;
    isProtected: boolean;
    permissionIds: string[];
    deletedAt: string | null;
  }
  interface RoleCreateRequest {
    code: string;
    name: string;
    description?: string | null;
  }
  interface RoleUpdateRequest {
    id: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
  }
  interface RolePermissionBatchRequest {
    roleId: string;
    permissionIds: string[];
  }
}

declare namespace ApiManagement {
  interface RoleListQuery extends PageQuery {
    code?: string;
    name?: string;
    isActive?: boolean;
    isSystem?: boolean;
  }
}
