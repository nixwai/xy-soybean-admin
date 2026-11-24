declare namespace ApiManagement {
  interface User {
    id: string;
    openId: string | null;
    unionId: string | null;
    nickname: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface UserListQuery extends PageQuery {
    id?: string;
    openId?: string;
    unionId?: string;
    nickname?: string;
    isActive?: boolean;
  }

  interface UserUpdateRequest {
    id: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  }
}
