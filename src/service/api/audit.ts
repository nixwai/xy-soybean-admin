import { request } from '../request';

/** 获取审计筛选项。 */
export function fetchAuditOptions() {
  return request<ApiManagement.AuditOptionsResponse>({ url: '/audit/options' });
}

export function fetchAuditList(params: ApiManagement.AuditQuery) {
  return request<ApiManagement.AuditListResponse>({ url: '/audit/list', params });
}
