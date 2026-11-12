declare namespace ApiManagement {
  interface Admin {
    id: string;
    username: string;
    isActive: boolean;
    isRoot: boolean;
    roleIds: string[];
    createdAt: string;
    updatedAt: string;
  }
  interface AdminCreateRequest {
    username: string;
    password: string;
    isRoot?: boolean;
    currentPassword?: string;
  }
  interface AdminUpdateRequest {
    id: string;
    username?: string;
    password?: string;
    isActive?: boolean;
    isRoot?: boolean;
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
}
