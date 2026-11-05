import { describe, expect, it } from 'vitest';
import { buildMenuTree, collectMenuBranchIds, toMenuTreeOptions } from '@/views/system-management/menu/utils/menu-tree';

function createMenu(id: string, parentId: string | null, order: number, title = `菜单${id}`): ApiManagement.Menu {
  return {
    id,
    parentId,
    title,
    path: `/menu-${id}`,
    icon: null,
    order,
    permissionCode: null,
    isRootOnly: false,
    isActive: true,
    deletedAt: null
  };
}

describe('buildMenuTree', () => {
  it('按 order 和 id 排序并构建父子关系', () => {
    const tree = buildMenuTree([
      createMenu('3', '1', 1),
      createMenu('1', null, 2),
      createMenu('2', null, 1),
      createMenu('4', '1', 0)
    ]);

    expect(tree.map(node => node.id)).toEqual(['2', '1']);
    expect(tree[1].children?.map(node => node.id)).toEqual(['4', '3']);
  });

  it('父级缺失时提升为根节点，避免菜单在界面上丢失', () => {
    const tree = buildMenuTree([createMenu('9', 'missing', 0)]);

    expect(tree.map(node => node.id)).toEqual(['9']);
  });
});

describe('collectMenuBranchIds', () => {
  it('收集自身和全部子孙，用于父级选择时排除循环', () => {
    const items = [
      createMenu('1', null, 0),
      createMenu('2', '1', 0),
      createMenu('3', '2', 0),
      createMenu('4', null, 1)
    ];

    expect(collectMenuBranchIds(items, '1').sort()).toEqual(['1', '2', '3']);
  });
});

describe('toMenuTreeOptions', () => {
  it('转换为选择器选项并排除指定分支', () => {
    const options = toMenuTreeOptions(buildMenuTree([createMenu('1', null, 0), createMenu('2', null, 1)]), ['1']);

    expect(options).toEqual([{ label: '菜单2', key: '2' }]);
  });
});
