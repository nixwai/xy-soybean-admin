import { request } from '../request';

/** 按关键词和状态分页查询微信用户。 */
export function fetchUserList(params: ApiManagement.UserListQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.User>>({ url: '/user/list', params });
}

/** 更新微信用户资料或启用状态。 */
export function fetchUserUpdate(data: ApiManagement.UserUpdateRequest) {
  return request<ApiManagement.User>({ url: '/user/update', method: 'post', data });
}
