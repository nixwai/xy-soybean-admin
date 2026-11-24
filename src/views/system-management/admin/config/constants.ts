import type {
  AdminDeleteModel,
  AdminFormModel,
  AdminPasswordFormModel,
  AdminQueryModel,
  AdminRoleAssignModel,
  AdminStatusFilter,
  AdminTypeFilter
} from '../typings';

/** 管理员列表的默认分页大小。 */
export const ADMIN_PAGE_SIZE = 20;

/** 管理员列表状态筛选选项。 */
export const ADMIN_STATUS_OPTIONS: Array<{ label: string; value: AdminStatusFilter }> = [
  { label: '已启用', value: 'active' },
  { label: '已停用', value: 'inactive' }
];

/** 管理员列表类型筛选选项。 */
export const ADMIN_TYPE_OPTIONS: Array<{ label: string; value: AdminTypeFilter }> = [
  { label: '根管理员', value: 'root' },
  { label: '普通管理员', value: 'regular' }
];

/** 创建管理员列表查询条件默认值。 */
export function createDefaultAdminQuery(): AdminQueryModel {
  return { id: '', username: '', statusFilter: null, typeFilter: null };
}

/** 后端用户名规则：字母、数字、点、下划线和连字符，长度 3-64。 */
export const ADMIN_USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,64}$/;

/** 后端密码规则：长度 8-72 且同时包含字母和数字。 */
export const ADMIN_PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

/** 创建独立的管理员编辑表单。 */
export function createAdminForm(): AdminFormModel {
  return { username: '', password: '', confirmPassword: '', isActive: true, isRoot: false, currentPassword: '' };
}

/** 将管理员记录转换为编辑表单，密码字段留空由用户按需填写。 */
export function toAdminForm(row: ApiManagement.Admin): AdminFormModel {
  return {
    username: row.username,
    password: '',
    confirmPassword: '',
    isActive: row.isActive,
    isRoot: row.isRoot,
    currentPassword: ''
  };
}

/** 创建独立的管理员密码重置表单。 */
export function createAdminPasswordForm(): AdminPasswordFormModel {
  return { password: '', confirmPassword: '', currentPassword: '' };
}

/** 创建独立的管理员角色分配表单。 */
export function createAdminRoleAssignForm(): AdminRoleAssignModel {
  return { roleIds: [] };
}

/** 创建独立的管理员删除确认表单。 */
export function createAdminDeleteForm(): AdminDeleteModel {
  return { currentPassword: '' };
}
