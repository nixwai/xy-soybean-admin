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

/** 管理员列表查询表单模型。 */
export interface AdminQueryModel {
  /** 管理员 ID。 */
  id: string;
  /** 登录用户名。 */
  username: string;
  /** 管理员启停状态。 */
  statusFilter: AdminStatusFilter | null;
  /** 管理员类型。 */
  typeFilter: AdminTypeFilter | null;
}

/** 管理员状态筛选值。 */
export type AdminStatusFilter = 'active' | 'inactive';

/** 管理员类型筛选值。 */
export type AdminTypeFilter = 'root' | 'regular';
