import type { PermissionQueryModel, PermissionStatusFilter } from '../typings';

/** 权限目录状态筛选选项。 */
export const PERMISSION_STATUS_OPTIONS: Array<{ label: string; value: PermissionStatusFilter }> = [
  { label: '已启用', value: 'active' },
  { label: '已停用', value: 'inactive' }
] as const;

/** 创建权限目录查询条件默认值。 */
export function createDefaultPermissionQuery(): PermissionQueryModel {
  return {
    code: '',
    name: '',
    description: '',
    categoryFilter: '',
    statusFilter: null
  };
}
