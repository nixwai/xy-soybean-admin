import { request } from '../request';

export function fetchPermissionList() {
  return request<ApiManagement.ListResponse<ApiManagement.Permission>>({ url: '/permission/list' });
}

export function enablePermission(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Permission>({ url: '/permission/enable', method: 'post', data });
}

export function disablePermission(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Permission>({ url: '/permission/disable', method: 'post', data });
}
