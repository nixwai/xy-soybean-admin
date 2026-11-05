/** 管理员新增和编辑表单模型，只承载用户可编辑字段。 */
export interface AdminFormModel {
  username: string;
  /** 新密码明文，编辑态留空表示不修改。 */
  password: string;
  confirmPassword: string;
  isActive: boolean;
  isRoot: boolean;
  /** 敏感变更时必填的当前登录管理员密码明文。 */
  currentPassword: string;
}

/** 管理员密码重置表单模型。 */
export interface AdminPasswordFormModel {
  password: string;
  confirmPassword: string;
  currentPassword: string;
}

/** 管理员角色分配表单模型。 */
export interface AdminRoleAssignModel {
  roleIds: string[];
}

/** 管理员删除确认表单模型。 */
export interface AdminDeleteModel {
  currentPassword: string;
}
