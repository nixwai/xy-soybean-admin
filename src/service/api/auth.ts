import { request } from '../request';

export function fetchAuthAdminPublicKey() {
  return request<Api.Auth.AdminPublicKeyResponse>({ url: '/auth/admin/public-key' });
}

export function fetchAuthAdminLogin(username: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/admin/login',
    method: 'post',
    data: { username, password }
  });
}

export function fetchAuthRefresh(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refresh',
    method: 'post',
    data: { refreshToken }
  });
}

export function fetchAuthLogout(refreshToken: string) {
  return request<null>({
    url: '/auth/logout',
    method: 'post',
    data: { refreshToken }
  });
}

export function fetchAdminMe() {
  return request<Api.Auth.AdminMeResponse>({ url: '/admin/me' });
}
