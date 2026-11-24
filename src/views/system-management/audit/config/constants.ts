import type { AuditQueryModel } from '../typings';

/** 审计日志每页条数，受后端游标分页 limit 上限约束。 */
export const AUDIT_PAGE_SIZE = 20;

/** 创建审计日志查询条件默认值。 */
export function createDefaultAuditQuery(): AuditQueryModel {
  return {
    actorAdminId: '',
    targetId: '',
    actionFilter: null,
    resourceTypeFilter: null,
    resultFilter: null,
    createdRange: null
  };
}
