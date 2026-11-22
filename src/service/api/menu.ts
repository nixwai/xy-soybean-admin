import { request } from '../request';

/** 查询未软删除的完整菜单列表。 */
export function fetchMenuList() {
  return request<ApiManagement.ListResponse<ApiManagement.Menu>>({ url: '/menu/list' });
}

/** 更新菜单标题、排序和启用状态，其他菜单元数据由后端维护。 */
export function fetchMenuUpdate(data: ApiManagement.MenuUpdateRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/update', method: 'post', data });
}

/** 启用菜单。 */
export function fetchMenuEnable(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/enable', method: 'post', data });
}

/** 停用菜单。 */
export function fetchMenuDisable(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/disable', method: 'post', data });
}
