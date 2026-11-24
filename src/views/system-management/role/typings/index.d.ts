/** 角色新增和编辑表单模型，权限绑定由独立的分配流程维护。 */
export interface RoleFormModel {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

/** 角色权限分配表单模型。 */
export interface RolePermissionAssignModel {
  permissionIds: string[];
}

/** 角色列表查询表单模型。 */
export interface RoleQueryModel {
  /** 角色编码。 */
  code: string;
  /** 角色名称。 */
  name: string;
  /** 角色启停状态。 */
  statusFilter: RoleStatusFilter | null;
  /** 角色来源类型。 */
  typeFilter: RoleTypeFilter | null;
}

/** 角色状态筛选值。 */
export type RoleStatusFilter = 'active' | 'inactive';

/** 角色类型筛选值。 */
export type RoleTypeFilter = 'system' | 'custom';
