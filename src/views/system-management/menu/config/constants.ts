import type { MenuFormModel, MenuPermissionFilter, MenuQueryModel, MenuStatusFilter } from '../typings';

/** 将菜单记录转换为仅包含后端允许修改字段的表单模型。 */
export function toMenuForm(row: ApiManagement.Menu): MenuFormModel {
  return { title: row.title, order: row.order, isActive: row.isActive };
}

/** 菜单列表状态筛选选项。 */
export const MENU_STATUS_OPTIONS: Array<{ label: string; value: MenuStatusFilter }> = [
  { label: '已启用', value: 'active' },
  { label: '已停用', value: 'inactive' }
] as const;

/** 菜单权限可用状态筛选选项。 */
export const MENU_PERMISSION_OPTIONS: Array<{ label: string; value: MenuPermissionFilter }> = [
  { label: '权限可用', value: 'available' },
  { label: '权限不可用', value: 'unavailable' }
] as const;

/** 创建菜单列表查询条件默认值。 */
export function createDefaultMenuQuery(): MenuQueryModel {
  return {
    title: '',
    menuKey: '',
    path: '',
    permissionCode: '',
    statusFilter: null,
    permissionFilter: null
  };
}
