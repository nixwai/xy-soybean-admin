declare namespace Api {
  namespace Auth {
    /** 登录接口返回的管理员公开身份。 */
    interface AdminIdentity {
      id: string;
      username: string;
      isRoot: boolean;
      /** 管理员身份类型，当前后端固定为 admin。 */
      role: string;
    }

    /** 登录或刷新接口返回的令牌集合。 */
    interface LoginToken {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      /** 访问令牌有效期，单位为秒。 */
      accessTokenExpiresIn: number;
      /** 刷新令牌有效期，单位为秒。 */
      refreshTokenExpiresIn: number;
      admin: AdminIdentity;
    }

    /** 当前管理员可见的菜单树节点。 */
    interface UserMenuItem {
      id: string;
      title: string;
      path: string;
      icon?: string;
      order: number;
      /** 菜单所需权限编码，为空表示登录即可见。 */
      permissionCode: string | null;
      children?: UserMenuItem[];
    }

    /** /admin/me 返回的当前管理员信息和授权信息。 */
    interface AdminMeResponse {
      id: string;
      username: string;
      isActive: boolean;
      isRoot: boolean;
      roleIds: string[];
      createdAt: string;
      updatedAt: string;
      /** 当前管理员可用的权限编码。 */
      permissions: string[];
      menus: UserMenuItem[];
    }

    /** 前端会话中持有的管理员授权状态。 */
    interface UserInfo {
      userId: string;
      userName: string;
      /** 根管理员为静态超级角色，普通管理员为已绑定角色 ID。 */
      roles: string[];
      /** 按钮级权限编码，与 permissions 同源。 */
      buttons: string[];
      permissions: string[];
      menus: UserMenuItem[];
      isRoot: boolean;
    }
  }
}
