/** 用户列表查询表单模型。 */
export interface UserQueryModel {
  /** 用户 ID。 */
  id: string;
  /** 微信 openId。 */
  openId: string;
  /** 微信 unionId。 */
  unionId: string;
  /** 用户昵称。 */
  nickname: string;
  /** 用户启停状态筛选值。 */
  statusFilter: UserStatusFilter | null;
}

/** 用户列表状态筛选值。 */
export type UserStatusFilter = 'active' | 'inactive';
