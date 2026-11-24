/** 审计日志查询表单模型。 */
export interface AuditQueryModel {
  /** 操作者管理员 ID。 */
  actorAdminId: string;
  /** 目标资源 ID。 */
  targetId: string;
  /** 操作编码。 */
  actionFilter: AuditActionFilter | null;
  /** 资源类型。 */
  resourceTypeFilter: AuditResourceTypeFilter | null;
  /** 操作结果。 */
  resultFilter: AuditResultFilter | null;
  /** 创建时间范围，时间戳单位为毫秒。 */
  createdRange: [number, number] | null;
}

/** 审计筛选项。 */
export interface AuditOption {
  label: string;
  value: string;
  disabled?: boolean;
  [key: string]: unknown;
}

/** 审计操作筛选值。 */
export type AuditActionFilter = string;

/** 审计资源类型筛选值。 */
export type AuditResourceTypeFilter = string;

/** 审计结果筛选值。 */
export type AuditResultFilter = 'succeeded' | 'failed';
