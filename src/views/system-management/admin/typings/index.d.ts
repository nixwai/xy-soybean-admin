/** 管理员表单模型。 */
export interface AdminFormModel {
  username: string;
  password: string;
  isSuperAdmin: boolean;
  currentPassword: string;
  roleIds: string[];
}

/** 管理员密码重置表单模型。 */
export interface AdminPasswordFormModel {
  password: string;
  currentPassword: string;
}
