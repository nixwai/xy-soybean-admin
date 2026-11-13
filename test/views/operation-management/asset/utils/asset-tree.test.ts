import { describe, expect, it } from 'vitest';
import {
  buildAssetTree,
  buildPersonalAssetTree,
  findAssetTreeNode
} from '@/views/operation-management/asset/utils/asset-tree';

const account = { id: '1', username: '账号A' };

/** 构造后端返回的文件夹树节点 */
function createFolder(
  id: string,
  name: string,
  children: ApiManagement.AssetFolderTreeNode[] = []
): ApiManagement.AssetFolderTreeNode {
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
  };
}

const owners: ApiManagement.AssetFolderOwnerTree[] = [
  { owner: account, children: [createFolder('10', '文件夹A', [createFolder('11', '文件夹B')])] },
  { owner: { id: '2', username: '账号B' }, children: [] }
];

describe('素材文件夹树转换', () => {
  it('使用账号作为虚拟根节点并保留多级父子关系', () => {
    const tree = buildAssetTree(owners);
    const owner = tree.find(node => node.key === 'owner:1');
    const folderA = owner?.children?.find(node => node.key === '10');
    const folderB = folderA?.children?.find(node => node.key === '11');

    expect(owner).toMatchObject({ key: 'owner:1', nodeType: 'owner', label: '账号A', ownerId: '1' });
    expect(folderA).toMatchObject({ key: '10', nodeType: 'folder', label: '文件夹A' });
    expect(folderB).toMatchObject({ key: '11', nodeType: 'folder', label: '文件夹B', ownerId: '1' });
  });

  it('没有文件夹的账号仍然作为根节点展示', () => {
    const owner = buildAssetTree(owners).find(node => node.key === 'owner:2');

    expect(owner).toMatchObject({ nodeType: 'owner', label: '账号B', ownerId: '2' });
    expect(owner?.children).toBeUndefined();
  });

  it('叶子节点不携带 children，避免 Naive UI 渲染展开图标', () => {
    const folderB = buildAssetTree(owners)
      .find(node => node.key === 'owner:1')
      ?.children?.find(node => node.key === '10')
      ?.children?.find(node => node.key === '11');

    expect(folderB?.children).toBeUndefined();
  });

  it('按节点标识查找节点，未命中或缺少标识时返回空', () => {
    const tree = buildAssetTree(owners);

    expect(findAssetTreeNode(tree, '11')?.label).toBe('文件夹B');
    expect(findAssetTreeNode(tree, '99')).toBeNull();
    expect(findAssetTreeNode(tree)).toBeNull();
  });
});

describe('个人视图文件夹树', () => {
  it('仅渲染当前账号顶层文件夹，不展示账号根节点', () => {
    const tree = buildPersonalAssetTree([owners[0]]);

    expect(tree).toMatchObject([{ key: '10', nodeType: 'folder', label: '文件夹A' }]);
    expect(tree[0].children).toMatchObject([{ key: '11', nodeType: 'folder', label: '文件夹B' }]);
  });

  it('账号无文件夹时返回空树', () => {
    expect(buildPersonalAssetTree([owners[1]])).toEqual([]);
    expect(buildPersonalAssetTree([])).toEqual([]);
  });
});
