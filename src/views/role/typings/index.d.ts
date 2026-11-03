/** 角色编辑表单模型。 */
export interface RoleFormModel {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  permissionIds: string[];
}
