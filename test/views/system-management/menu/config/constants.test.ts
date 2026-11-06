import { describe, expect, it } from 'vitest';
import { toMenuForm } from '@/views/system-management/menu/config/constants';

describe('menu form conversion', () => {
  it('仅回填后端允许修改的字段', () => {
    expect(
      toMenuForm({
        id: 'menu-1',
        menuKey: 'home',
        parentKey: null,
        title: '首页',
        path: '/home',
        order: 1,
        permissionCode: null,
        isRootOnly: false,
        isActive: true,
        permissionAvailable: true
      })
    ).toEqual({ title: '首页', order: 1, isActive: true });
  });
});
