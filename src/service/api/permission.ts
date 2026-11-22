import { request } from '../request';

/** 查询完整权限目录，按分类分组返回，包含受保护和停用权限。 */
export function fetchPermissionList() {
  return request<ApiManagement.PermissionGroupListResponse>({ url: '/permission/list' });
}

/** 查询可绑定给普通角色的权限目录，按分类分组返回。 */
export function fetchPermissionAssignableList() {
  return request<ApiManagement.PermissionGroupListResponse>({ url: '/permission/assignable-list' });
}

/** 启用权限。 */
export function fetchPermissionEnable(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Permission>({ url: '/permission/enable', method: 'post', data });
}

/** 停用权限。 */
export function fetchPermissionDisable(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Permission>({ url: '/permission/disable', method: 'post', data });
}
