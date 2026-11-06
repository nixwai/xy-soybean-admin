import type { MenuFormModel } from '../typings';

/** 将菜单记录转换为仅包含后端允许修改字段的表单模型。 */
export function toMenuForm(row: ApiManagement.Menu): MenuFormModel {
  return { title: row.title, order: row.order, isActive: row.isActive };
}
