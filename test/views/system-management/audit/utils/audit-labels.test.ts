import { describe, expect, it } from 'vitest';
import { formatAuditDetails } from '@/views/system-management/audit/utils/audit-labels';

describe('formatAuditDetails', () => {
  it('将变更摘要格式化为单行文本', () => {
    expect(formatAuditDetails({ isRoot: true, roleId: '2' })).toBe('isRoot: true，roleId: 2');
  });

  it('嵌套对象序列化为 JSON，空摘要返回占位符', () => {
    expect(formatAuditDetails({ diff: { a: 1 } })).toBe('diff: {"a":1}');
    expect(formatAuditDetails(null)).toBe('-');
    expect(formatAuditDetails({})).toBe('-');
  });
});
