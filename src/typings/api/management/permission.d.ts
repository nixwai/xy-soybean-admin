declare namespace ApiManagement {
  interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string;
    isAssignable: boolean;
    isProtected: boolean;
    isActive: boolean;
  }
  interface PermissionGroup {
    category: string;
    categoryName: string;
    permissions: Permission[];
  }
  interface PermissionGroupListResponse {
    groups: PermissionGroup[];
    total: number;
  }
}
