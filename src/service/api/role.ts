import { request } from '../request';

/** 分页查询未软删除的角色列表。 */
export function fetchRoleList(params: ApiManagement.PageQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Role>>({ url: '/role/list', params });
}

/** 创建角色，编码创建后不可修改。 */
export function createRole(data: ApiManagement.RoleCreateRequest) {
  return request<ApiManagement.Role>({ url: '/role/create', method: 'post', data });
}

/** 更新角色名称、描述或启用状态。 */
export function updateRole(data: ApiManagement.RoleUpdateRequest) {
  return request<ApiManagement.Role>({ url: '/role/update', method: 'post', data });
}

/** 软删除角色。 */
export function softDeleteRole(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/role/soft-delete', method: 'post', data });
}

/** 为角色批量绑定权限，仅可绑定启用且可分配的非受保护权限。 */
export function bindRolePermissions(data: ApiManagement.RolePermissionBatchRequest) {
  return request<null>({ url: '/role/permission-bind', method: 'post', data });
}

/** 批量解除角色权限绑定，服务端允许清理已失效的权限关联。 */
export function unbindRolePermissions(data: ApiManagement.RolePermissionBatchRequest) {
  return request<null>({ url: '/role/permission-unbind', method: 'post', data });
}
