import { describe, expect, it } from 'vitest';
import {
  formatAuditDetails,
  getAuditActionLabel,
  getAuditResourceLabel
} from '@/views/system-management/audit/utils/audit-labels';

describe('审计标签映射', () => {
  it('已登记的动作和资源返回中文名称', () => {
    expect(getAuditActionLabel('admin.role-bind')).toBe('绑定管理员角色');
    expect(getAuditResourceLabel('permission')).toBe('权限');
  });

  it('未登记的编码原样返回，避免信息丢失', () => {
    expect(getAuditActionLabel('resource.create')).toBe('resource.create');
    expect(getAuditResourceLabel('resource')).toBe('resource');
  });
});

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
