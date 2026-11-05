/**
 * 后端布尔字段以 MySQL tinyint 存储，序列化结果可能是 0/1 而非 true/false，
 * 且同一字段在列表、创建和状态变更接口中表现不一致。
 * 在响应进入业务层之前统一归一化，业务代码只需处理标准 boolean。
 */
const BOOLEAN_FIELDS: ReadonlySet<string> = new Set([
  'isActive',
  'isAssignable',
  'isProtected',
  'isRoot',
  'isRootOnly',
  'isSystem',
  'succeeded'
]);

/** 递归归一化响应数据中约定的布尔字段。 */
export function normalizeBooleanFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => normalizeBooleanFields(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    BOOLEAN_FIELDS.has(key) ? Boolean(item) : normalizeBooleanFields(item)
  ]);

  return Object.fromEntries(entries) as T;
}
