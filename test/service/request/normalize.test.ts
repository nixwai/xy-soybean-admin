import { describe, expect, it } from 'vitest';
import { normalizeBooleanFields } from '@/service/request/normalize';

describe('normalizeBooleanFields', () => {
  it('将后端 tinyint 表达的布尔字段归一化为 boolean', () => {
    expect(normalizeBooleanFields({ id: '1', isActive: 1, isRoot: 0 })).toEqual({
      id: '1',
      isActive: true,
      isRoot: false
    });
  });

  it('递归处理数组和嵌套对象', () => {
    const source = {
      items: [{ id: '1', isProtected: 1, details: { succeeded: 0 } }],
      total: 1
    };

    expect(normalizeBooleanFields(source)).toEqual({
      items: [{ id: '1', isProtected: true, details: { succeeded: false } }],
      total: 1
    });
  });

  it('保留非约定字段和空值语义', () => {
    expect(normalizeBooleanFields({ isSystem: 1, order: 0, deletedAt: null, name: 'x' })).toEqual({
      isSystem: true,
      order: 0,
      deletedAt: null,
      name: 'x'
    });
    expect(normalizeBooleanFields(null)).toBeNull();
  });
});
