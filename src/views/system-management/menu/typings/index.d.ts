/** 菜单编辑表单模型。 */
export interface MenuFormModel {
  parentId: string;
  title: string;
  path: string;
  icon: string;
  order: string;
  permissionCode: string;
  isActive: boolean;
}
