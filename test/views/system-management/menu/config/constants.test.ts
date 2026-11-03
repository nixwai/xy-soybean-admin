import { describe, expect, it } from 'vitest';
import { createMenuForm, toMenuForm } from '@/views/system-management/menu/config/constants';

describe('menu form conversion', () => {
  it('creates the next order as a string', () => {
    expect(createMenuForm(3).order).toBe('3');
  });

  it('normalizes nullable menu fields for editing', () => {
    expect(
      toMenuForm({
        id: 'menu-1',
        parentId: null,
        title: '首页',
        path: '/home',
        icon: null,
        order: 1,
        permissionCode: null,
        isActive: true,
        deletedAt: null
      })
    ).toEqual({
      parentId: '',
      title: '首页',
      path: '/home',
      icon: '',
      order: '1',
      permissionCode: '',
      isActive: true
    });
  });
});
