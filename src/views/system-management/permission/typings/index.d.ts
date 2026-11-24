/** 权限目录查询表单模型。 */
export interface PermissionQueryModel {
  /** 权限编码。 */
  code: string;
  /** 权限名称。 */
  name: string;
  /** 权限描述。 */
  description: string;
  /** 权限分类。 */
  categoryFilter: string;
  /** 权限启停状态。 */
  statusFilter: PermissionStatusFilter | null;
}

/** 权限状态筛选值。 */
export type PermissionStatusFilter = 'active' | 'inactive';
