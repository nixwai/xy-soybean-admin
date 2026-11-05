import { request } from '../request';

/** 查询未软删除的完整菜单列表，不分页。 */
export function fetchMenuList() {
  return request<ApiManagement.ListResponse<ApiManagement.Menu>>({ url: '/menu/list' });
}

/** 创建菜单。 */
export function createMenu(data: ApiManagement.MenuCreateRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/create', method: 'post', data });
}

/** 更新菜单，请求体需携带完整字段。 */
export function updateMenu(data: ApiManagement.MenuUpdateRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/update', method: 'post', data });
}

/** 软删除菜单。 */
export function softDeleteMenu(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/menu/soft-delete', method: 'post', data });
}

/** 启用菜单。 */
export function enableMenu(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/enable', method: 'post', data });
}

/** 停用菜单。 */
export function disableMenu(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/disable', method: 'post', data });
}
