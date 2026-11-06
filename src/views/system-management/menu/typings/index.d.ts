/** 菜单编辑表单模型，仅承载后端允许修改的字段。 */
export interface MenuFormModel {
  title: string;
  order: number;
  isActive: boolean;
}

/** 菜单树节点，用于表格树形展示。 */
export interface MenuTreeNode extends ApiManagement.Menu {
  children?: MenuTreeNode[];
}
