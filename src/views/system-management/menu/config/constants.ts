import type { MenuFormModel } from '../typings';

/** 创建菜单编辑表单，并填充默认排序值。 */
export function createMenuForm(order = 1): MenuFormModel {
  return { parentId: '', title: '', path: '', icon: '', order: String(order), permissionCode: '', isActive: true };
}

/** 将菜单接口数据转换为编辑表单模型。 */
export function toMenuForm(row: ApiManagement.Menu): MenuFormModel {
  return {
    parentId: row.parentId || '',
    title: row.title,
    path: row.path,
    icon: row.icon || '',
    order: String(row.order),
    permissionCode: row.permissionCode || '',
    isActive: row.isActive
  };
}
