/** 用户列表查询表单模型。 */
export interface UserQueryModel {
  /** 用户 ID、微信标识或昵称关键词。 */
  keyword: string;
  /** 用户启停状态筛选值。 */
  statusFilter: UserStatusFilter;
}

/** 用户列表状态筛选值。 */
export type UserStatusFilter = 'all' | 'active' | 'inactive';
