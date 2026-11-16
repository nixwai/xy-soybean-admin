import type { UserQueryModel, UserStatusFilter } from '../typings';

/** 用户列表默认分页大小。 */
export const USER_PAGE_SIZE = 20;

/** 用户列表状态筛选选项。 */
export const USER_STATUS_OPTIONS: Array<{ label: string; value: UserStatusFilter }> = [
  { label: '全部状态', value: 'all' },
  { label: '已启用', value: 'active' },
  { label: '已停用', value: 'inactive' }
];

/** 创建用户列表查询条件默认值。 */
export function createDefaultUserQuery(): UserQueryModel {
  return {
    keyword: '',
    statusFilter: 'all'
  };
}
