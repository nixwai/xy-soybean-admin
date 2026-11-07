/** 将审计变更摘要格式化为单行文本，无摘要时返回占位符。 */
export function formatAuditDetails(details: Record<string, unknown> | null) {
  if (!details || !Object.keys(details).length) return '-';

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join('，');
}
