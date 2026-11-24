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

/** 菜单列表查询表单模型。 */
export interface MenuQueryModel {
  /** 菜单标题。 */
  title: string;
  /** 菜单标识。 */
  menuKey: string;
  /** 菜单路径。 */
  path: string;
  /** 权限编码。 */
  permissionCode: string;
  /** 菜单启停状态。 */
  statusFilter: MenuStatusFilter | null;
  /** 菜单权限可用状态。 */
  permissionFilter: MenuPermissionFilter | null;
}

/** 菜单状态筛选值。 */
export type MenuStatusFilter = 'active' | 'inactive';

/** 菜单权限可用状态筛选值。 */
export type MenuPermissionFilter = 'available' | 'unavailable';
