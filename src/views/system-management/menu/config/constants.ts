import type { MenuFormModel } from '../typings';

/** 新增菜单时的默认排序值。 */
export const MENU_DEFAULT_ORDER = 0;

/** 创建菜单编辑表单，可预填父级菜单和排序值。 */
export function createMenuForm(order = MENU_DEFAULT_ORDER, parentId: string | null = null): MenuFormModel {
  return { parentId, title: '', path: '', icon: '', order, permissionCode: null, isRootOnly: false, isActive: true };
}

/** 将菜单记录转换为编辑表单模型。 */
export function toMenuForm(row: ApiManagement.Menu): MenuFormModel {
  return {
    parentId: row.parentId,
    title: row.title,
    path: row.path,
    icon: row.icon ?? '',
    order: row.order,
    permissionCode: row.permissionCode,
    isRootOnly: row.isRootOnly,
    isActive: row.isActive
  };
}
