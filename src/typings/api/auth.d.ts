declare namespace Api {
  namespace Auth {
    interface LoginToken {
      accessToken: string;
      refreshToken: string;
    }

    interface UserMenuItem {
      id: string;
      title: string;
      path: string;
      icon?: string;
      order: number;
      children?: UserMenuItem[];
    }

    interface AdminMeResponse {
      id: string;
      username: string;
      isActive: boolean;
      isSuperAdmin: boolean;
      roleIds: string[];
      permissions: string[];
      menus: UserMenuItem[];
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
      permissions: string[];
      menus: UserMenuItem[];
      isSuperAdmin?: boolean;
    }
  }
}
