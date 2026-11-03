import { request } from '../request';

export function fetchMenuList() {
  return request<ApiManagement.ListResponse<ApiManagement.Menu>>({ url: '/menu/list' });
}

export function createMenu(data: ApiManagement.MenuCreateRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/create', method: 'post', data });
}

export function updateMenu(data: ApiManagement.MenuUpdateRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/update', method: 'post', data });
}

export function softDeleteMenu(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/menu/soft-delete', method: 'post', data });
}

export function enableMenu(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/enable', method: 'post', data });
}

export function disableMenu(data: ApiManagement.IdRequest) {
  return request<ApiManagement.Menu>({ url: '/menu/disable', method: 'post', data });
}
