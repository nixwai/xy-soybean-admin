import { describe, expect, it } from 'vitest';
import { buildMenuTree } from '@/views/system-management/menu/utils/menu-tree';

describe('菜单树构建', () => {
  it('按 parentKey 组装层级并按 order、menuKey 稳定排序', () => {
    const items = [
      {
        id: '3',
        menuKey: 'child-b',
        parentKey: 'root',
        title: 'B',
        path: '/b',
        order: 2
      },
      {
        id: '1',
        menuKey: 'root',
        parentKey: null,
        title: '根',
        path: '/',
        order: 1
      },
      {
        id: '2',
        menuKey: 'child-a',
        parentKey: 'root',
        title: 'A',
        path: '/a',
        order: 1
      },
      {
        id: '4',
        menuKey: 'orphan',
        parentKey: 'missing',
        title: '孤儿',
        path: '/orphan',
        order: 0
      }
    ] as ApiManagement.Menu[];

    expect(buildMenuTree(items)).toMatchObject([
      { menuKey: 'orphan', title: '孤儿' },
      {
        menuKey: 'root',
        children: [
          { menuKey: 'child-a', title: 'A' },
          { menuKey: 'child-b', title: 'B' }
        ]
      }
    ]);
  });

  it('不修改后端返回的菜单数组和节点对象', () => {
    const items = [
      {
        id: '1',
        menuKey: 'root',
        parentKey: null,
        title: '根',
        path: '/',
        order: 1
      },
      {
        id: '2',
        menuKey: 'child',
        parentKey: 'root',
        title: '子',
        path: '/child',
        order: 1
      }
    ] as ApiManagement.Menu[];
    const snapshot = structuredClone(items);

    buildMenuTree(items);

    expect(items).toEqual(snapshot);
  });
});
