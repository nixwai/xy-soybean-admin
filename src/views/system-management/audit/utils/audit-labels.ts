import { AUDIT_ACTION_LABELS, AUDIT_RESOURCE_LABELS } from '../config/constants';

/** 查询审计动作的中文名称，未登记时回退为原始编码。 */
export function getAuditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

/** 查询审计资源类型的中文名称，未登记时回退为原始标识。 */
export function getAuditResourceLabel(resourceType: string) {
  return AUDIT_RESOURCE_LABELS[resourceType] ?? resourceType;
}

/** 将审计变更摘要格式化为单行文本，无摘要时返回占位符。 */
export function formatAuditDetails(details: Record<string, unknown> | null) {
  if (!details || !Object.keys(details).length) return '-';

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join('，');
}
