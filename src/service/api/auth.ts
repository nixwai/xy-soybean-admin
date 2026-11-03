import { request } from '../request';

export interface AdminPublicKeyResponse {
  publicKey: string;
}

export function fetchAdminPublicKey() {
  return request<AdminPublicKeyResponse>({ url: '/auth/admin/public-key' });
}

export function fetchLogin(username: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/admin/login',
    method: 'post',
    data: { username, password }
  });
}

export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refresh',
    method: 'post',
    data: { refreshToken }
  });
}

export function fetchLogout(refreshToken: string) {
  return request<null>({
    url: '/auth/logout',
    method: 'post',
    data: { refreshToken }
  });
}

export function fetchGetUserInfo() {
  return request<Api.Auth.AdminMeResponse>({ url: '/admin/me' });
}
