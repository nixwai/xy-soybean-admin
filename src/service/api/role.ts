import { request } from '../request';

export function fetchRoleList(params: ApiManagement.PageQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Role>>({ url: '/role/list', params });
}

export function createRole(data: ApiManagement.RoleCreateRequest) {
  return request<ApiManagement.Role>({ url: '/role/create', method: 'post', data });
}

export function updateRole(data: ApiManagement.RoleUpdateRequest) {
  return request<ApiManagement.Role>({ url: '/role/update', method: 'post', data });
}

export function softDeleteRole(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/role/soft-delete', method: 'post', data });
}

export function bindRolePermission(data: ApiManagement.RolePermissionBindingRequest) {
  return request<null>({ url: '/role/permission-bind', method: 'post', data });
}

export function unbindRolePermission(data: ApiManagement.RolePermissionBindingRequest) {
  return request<null>({ url: '/role/permission-unbind', method: 'post', data });
}
