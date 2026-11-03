import type { RoleFormModel } from '../typings';

/** 角色列表的默认分页大小。 */
export const ROLE_PAGE_SIZE = 20;

/** 创建独立的角色编辑表单。 */
export function createRoleForm(): RoleFormModel {
  return { code: '', name: '', description: '', isActive: true, permissionIds: [] };
}
