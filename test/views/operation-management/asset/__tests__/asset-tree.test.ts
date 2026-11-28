import { describe, expect, it } from 'vitest';
import {
  buildAssetTree,
  buildPersonalAssetTree,
  findAssetTreeNode
} from '@/views/operation-management/asset/components/asset-folder-panel/utils/asset-tree';

function folder(id: string, name: string, children: ApiManagement.AssetFolderTreeNode[] = []) {
  const account = { id: '1', username: '账号A' };
  return {
    id,
    name,
    parentId: null,
    ownerId: account.id,
    creatorId: account.id,
    createdAt: '',
    updatedAt: '',
    owner: account,
    creator: account,
    children
  } satisfies ApiManagement.AssetFolderTreeNode;
}

const owners = [
  {
    owner: { id: '1', username: '账号A' },
    children: [folder('10', '父目录', [folder('11', '子目录')])]
  },
  { owner: { id: '2', username: '账号B' }, children: [] }
] satisfies ApiManagement.AssetFolderOwnerTree[];

describe('素材树转换', () => {
  it('在全部视图中保留账号虚拟根节点和多级目录', () => {
    const tree = buildAssetTree(owners);
    const owner = tree.find(item => item.key === 'owner:1');
    const parent = owner?.children?.find(item => item.key === '10');

    expect(owner).toMatchObject({
      key: 'owner:1',
      nodeType: 'owner',
      ownerId: '1',
      label: '账号A'
    });
    expect(parent).toMatchObject({
      key: '10',
      nodeType: 'folder',
      label: '父目录'
    });
    expect(parent?.children).toEqual([expect.objectContaining({ key: '11', label: '子目录' })]);
    expect(tree.find(item => item.key === 'owner:2')?.children).toBeUndefined();
  });

  it('个人视图隐藏账号根节点，叶子节点不携带 children', () => {
    const tree = buildPersonalAssetTree([owners[0]]);

    expect(tree).toMatchObject([{ key: '10', nodeType: 'folder', label: '父目录' }]);
    expect(tree[0].children).toEqual([expect.objectContaining({ key: '11', label: '子目录' })]);
    expect(tree[0].children?.[0].children).toBeUndefined();
  });

  it('按稳定节点键深度查找，缺失键返回 null', () => {
    const tree = buildAssetTree(owners);

    expect(findAssetTreeNode(tree, '11')).toMatchObject({
      label: '子目录',
      ownerId: '1'
    });
    expect(findAssetTreeNode(tree, 'missing')).toBeNull();
    expect(findAssetTreeNode(tree)).toBeNull();
  });
});
