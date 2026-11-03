import type { AdminFormModel, AdminPasswordFormModel } from '../typings';

/** 管理员列表的默认分页大小。 */
export const ADMIN_PAGE_SIZE = 20;

/** 创建独立的管理员编辑表单。 */
export function createAdminForm(): AdminFormModel {
  return { username: '', password: '', isSuperAdmin: false, currentPassword: '', roleIds: [] };
}

/** 创建独立的管理员密码表单。 */
export function createAdminPasswordForm(): AdminPasswordFormModel {
  return { password: '', currentPassword: '' };
}
