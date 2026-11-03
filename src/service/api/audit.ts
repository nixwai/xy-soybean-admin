import { request } from '../request';

export function fetchAuditList(params: ApiManagement.AuditQuery) {
  return request<ApiManagement.AuditListResponse>({ url: '/audit/list', params });
}
