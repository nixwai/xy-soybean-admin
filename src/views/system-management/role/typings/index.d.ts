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
