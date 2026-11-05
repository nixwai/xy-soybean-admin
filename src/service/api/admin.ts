import { request } from '../request';

/** 分页查询未软删除的管理员列表。 */
export function fetchAdminList(params: ApiManagement.PageQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Admin>>({ url: '/admin/list', params });
}

/** 创建管理员，密码字段需为 RSA-OAEP-SHA256 密文。 */
export function createAdmin(data: ApiManagement.AdminCreateRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/create', method: 'post', data });
}

/** 更新管理员用户名、密码、启用状态或根管理员身份。 */
export function updateAdmin(data: ApiManagement.AdminUpdateRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/update', method: 'post', data });
}

/** 重置指定管理员密码，需复核当前登录管理员密码。 */
export function resetAdminPassword(data: ApiManagement.AdminResetPasswordRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/reset-password', method: 'post', data });
}

/** 软删除管理员，需复核当前登录管理员密码。 */
export function softDeleteAdmin(data: ApiManagement.SensitiveIdRequest) {
  return request<null>({ url: '/admin/soft-delete', method: 'post', data });
}

/** 为管理员绑定单个角色。 */
export function bindAdminRole(data: ApiManagement.AdminRoleBindingRequest) {
  return request<null>({ url: '/admin/role-bind', method: 'post', data });
}

/** 解除管理员的单个角色绑定。 */
export function unbindAdminRole(data: ApiManagement.AdminRoleBindingRequest) {
  return request<null>({ url: '/admin/role-unbind', method: 'post', data });
}
