import { describe, expect, it } from 'vitest';
import { normalizeBooleanFields } from '@/service/request/normalize';

describe('后端布尔字段归一化', () => {
  it('递归转换约定字段并保留其他字段及输入不可变', () => {
    const source = {
      id: '1',
      isActive: 1,
      isRoot: 0,
      order: 0,
      nested: [{ isProtected: 1, succeeded: 0, name: 'item' }]
    };

    expect(normalizeBooleanFields(source)).toEqual({
      id: '1',
      isActive: true,
      isRoot: false,
      order: 0,
      nested: [{ isProtected: true, succeeded: false, name: 'item' }]
    });
    expect(source).toEqual({
      id: '1',
      isActive: 1,
      isRoot: 0,
      order: 0,
      nested: [{ isProtected: 1, succeeded: 0, name: 'item' }]
    });
  });

  it('按 JavaScript 布尔语义处理字段并保留空值和原始值', () => {
    expect(normalizeBooleanFields(null)).toBeNull();
    expect(normalizeBooleanFields(undefined)).toBeUndefined();
    expect(normalizeBooleanFields({ isActive: '', isRoot: '0', count: 0 })).toEqual({
      isActive: false,
      isRoot: true,
      count: 0
    });
  });
});
