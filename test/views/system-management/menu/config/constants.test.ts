import { describe, expect, it } from 'vitest';
import { createMenuForm, toMenuForm } from '@/views/system-management/menu/config/constants';

describe('menu form conversion', () => {
  it('创建时可预填排序值和父级菜单', () => {
    expect(createMenuForm(3, 'parent-1')).toEqual({
      parentId: 'parent-1',
      title: '',
      path: '',
      icon: '',
      order: 3,
      permissionCode: null,
      isRootOnly: false,
      isActive: true
    });
  });

  it('保留可空字段语义，供编辑表单直接回填', () => {
    expect(
      toMenuForm({
        id: 'menu-1',
        parentId: null,
        title: '首页',
        path: '/home',
        icon: null,
        order: 1,
        permissionCode: null,
        isRootOnly: false,
        isActive: true,
        deletedAt: null
      })
    ).toEqual({
      parentId: null,
      title: '首页',
      path: '/home',
      icon: '',
      order: 1,
      permissionCode: null,
      isRootOnly: false,
      isActive: true
    });
  });
});
