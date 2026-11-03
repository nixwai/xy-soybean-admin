import { request } from '../request';

export function fetchAdminList(params: ApiManagement.PageQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Admin>>({ url: '/admin/list', params });
}

export function createAdmin(data: ApiManagement.AdminCreateRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/create', method: 'post', data });
}

export function updateAdmin(data: ApiManagement.AdminUpdateRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/update', method: 'post', data });
}

export function resetAdminPassword(data: ApiManagement.AdminResetPasswordRequest) {
  return request<ApiManagement.Admin>({ url: '/admin/reset-password', method: 'post', data });
}

export function softDeleteAdmin(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/admin/soft-delete', method: 'post', data });
}

export function bindAdminRole(data: ApiManagement.AdminRoleBindingRequest) {
  return request<null>({ url: '/admin/role-bind', method: 'post', data });
}

export function unbindAdminRole(data: ApiManagement.AdminRoleBindingRequest) {
  return request<null>({ url: '/admin/role-unbind', method: 'post', data });
}
