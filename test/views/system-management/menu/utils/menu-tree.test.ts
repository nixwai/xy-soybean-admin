import { describe, expect, it } from 'vitest';
import { buildMenuTree } from '@/views/system-management/menu/utils/menu-tree';

function createMenu(
  menuKey: string,
  parentKey: string | null,
  order: number,
  title = `菜单${menuKey}`
): ApiManagement.Menu {
  return {
    id: menuKey,
    menuKey,
    parentKey,
    title,
    path: `/menu-${menuKey}`,
    order,
    permissionCode: null,
    isRootOnly: false,
    isActive: true,
    permissionAvailable: true
  };
}

describe('buildMenuTree', () => {
  it('按 order 和 menuKey 排序并构建父子关系', () => {
    const tree = buildMenuTree([
      createMenu('child-3', 'root-1', 1),
      createMenu('root-1', null, 2),
      createMenu('root-2', null, 1),
      createMenu('child-4', 'root-1', 0)
    ]);
    expect(tree.map(node => node.menuKey)).toEqual(['root-2', 'root-1']);
    expect(tree[1].children?.map(node => node.menuKey)).toEqual(['child-4', 'child-3']);
  });

  it('父级缺失时提升为根节点', () => {
    expect(buildMenuTree([createMenu('orphan', 'missing', 0)]).map(node => node.menuKey)).toEqual(['orphan']);
  });
});
