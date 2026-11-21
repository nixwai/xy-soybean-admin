import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { createUserColumns } from '@/views/system-management/user/utils/user-columns';

const createHandlers = (canUpdate: boolean) => ({
  canUpdate,
  pendingStatusId: ref(''),
  onToggleStatus: vi.fn()
});

function hasColumnKey(columns: ReturnType<typeof createUserColumns>, key: string) {
  return columns.some(column => 'key' in column && column.key === key);
}

describe('createUserColumns', () => {
  it('没有更新权限时隐藏操作列', () => {
    const columns = createUserColumns(createHandlers(false));

    expect(hasColumnKey(columns, 'isActive')).toBe(true);
    expect(hasColumnKey(columns, 'actions')).toBe(false);
  });

  it('拥有更新权限时提供操作列', () => {
    const columns = createUserColumns(createHandlers(true));

    expect(hasColumnKey(columns, 'actions')).toBe(true);
    expect(columns.find(column => 'key' in column && column.key === 'actions')).toBeDefined();
  });
});
