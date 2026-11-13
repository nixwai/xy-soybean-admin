import { describe, expect, it } from 'vitest';
import { buildAssetTree, findAssetTreeNode } from '@/views/operation-management/asset/utils/asset-tree';

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

    expect(owner).toMatchObject({ nodeType: 'owner', label: '账号B', ownerId: '2', children: [] });
  });

  it('按节点标识查找节点，未命中或缺少标识时返回空', () => {
    const tree = buildAssetTree(owners);

    expect(findAssetTreeNode(tree, '11')?.label).toBe('文件夹B');
    expect(findAssetTreeNode(tree, '99')).toBeNull();
    expect(findAssetTreeNode(tree)).toBeNull();
  });
});
