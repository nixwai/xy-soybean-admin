/** 菜单编辑表单模型。 */
export interface MenuFormModel {
  parentId: string | null;
  title: string;
  path: string;
  icon: string;
  order: number;
  permissionCode: string | null;
  /** 是否仅根管理员可见。 */
  isRootOnly: boolean;
  isActive: boolean;
}

/** 菜单树节点，用于表格树形展示。 */
export interface MenuTreeNode extends ApiManagement.Menu {
  children?: MenuTreeNode[];
}

/** 父级菜单选择器选项，使用类型别名以满足 NTreeSelect 选项的索引签名要求。 */
export type MenuTreeOption = {
  label: string;
  key: string;
  children?: MenuTreeOption[];
};
