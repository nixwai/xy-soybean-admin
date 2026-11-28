import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const { fetchAssetFolderTree, fetchAssetFolderTreeAll } = vi.hoisted(() => ({
  fetchAssetFolderTree: vi.fn(),
  fetchAssetFolderTreeAll: vi.fn()
}));
const auth = vi.hoisted(() => ({ permissions: [] as string[] }));

vi.mock('@/service/api', () => ({ fetchAssetFolderTree, fetchAssetFolderTreeAll }));
vi.mock('@/hooks/business/auth', () => ({
  useAuth: () => ({ hasAuth: (code: string) => auth.permissions.includes(code) })
}));
vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({ userInfo: { userId: '1' } })
}));

import { PERMISSION_CODE } from '@/constants/permission';
import { useAssetFolderTree } from '@/views/operation-management/asset/components/asset-folder-panel/hooks/use-asset-folder-tree';
import { useAssetContextStore } from '@/views/operation-management/asset/store';

/** 构造按账号分组的文件夹树响应。 */
function buildOwners(): ApiManagement.AssetFolderOwnerTree[] {
  return [
    {
      owner: { id: '1', username: 'admin' },
      children: [
        {
          id: '10',
          name: 'ABC',
          parentId: null,
          ownerId: '1',
          creatorId: '1',
          createdAt: '',
          updatedAt: '',
          owner: { id: '1', username: 'admin' },
          creator: { id: '1', username: 'admin' },
          children: [
            {
              id: '11',
              name: 'abc',
              parentId: '10',
              ownerId: '1',
              creatorId: '1',
              createdAt: '',
              updatedAt: '',
              owner: { id: '1', username: 'admin' },
              creator: { id: '1', username: 'admin' },
              children: []
            }
          ]
        }
      ]
    },
    { owner: { id: '2', username: 'nxx' }, children: [] }
  ] as unknown as ApiManagement.AssetFolderOwnerTree[];
}

describe('素材文件夹树范围与展开', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchAssetFolderTree.mockReset();
    fetchAssetFolderTreeAll.mockReset();
    fetchAssetFolderTree.mockResolvedValue({ data: { owners: buildOwners() }, error: null });
    fetchAssetFolderTreeAll.mockResolvedValue({ data: { owners: buildOwners() }, error: null });
    auth.permissions = [PERMISSION_CODE.ASSET_FOLDER_READ, PERMISSION_CODE.ASSET_FOLDER_ALL];
  });

  it('个人视图默认不展开任何节点', async () => {
    const tree = useAssetFolderTree();

    await tree.loadTree();

    expect(fetchAssetFolderTree).toHaveBeenCalledOnce();
    expect(tree.expandedKeys.value).toEqual([]);
    expect(tree.treeData.value.map(node => node.label)).toEqual(['ABC']);
  });

  it('全部视图默认展开账号根节点，文件夹直接可见', async () => {
    const context = useAssetContextStore();
    const tree = useAssetFolderTree();
    context.setScopeAll(true);

    await tree.loadTree();

    expect(fetchAssetFolderTreeAll).toHaveBeenCalledOnce();
    expect(tree.expandedKeys.value).toEqual(['owner:1', 'owner:2']);
    expect(tree.treeData.value.map(node => node.label)).toEqual(['admin', 'nxx']);
  });

  it('切换到全部视图会重新取数、清空选中并展开根节点', async () => {
    const tree = useAssetFolderTree();
    await tree.loadTree();
    tree.selectedKeys.value = ['10'];

    await tree.changeScope(true);

    expect(tree.scopeAll.value).toBe(true);
    expect(tree.selectedKeys.value).toEqual([]);
    expect(tree.expandedKeys.value).toEqual(['owner:1', 'owner:2']);
    expect(fetchAssetFolderTreeAll).toHaveBeenCalledOnce();
  });

  it('缺少全局权限时拒绝切换到全部视图', async () => {
    auth.permissions = [PERMISSION_CODE.ASSET_FOLDER_READ];
    const tree = useAssetFolderTree();

    await tree.changeScope(true);

    expect(tree.scopeAll.value).toBe(false);
    expect(fetchAssetFolderTreeAll).not.toHaveBeenCalled();
  });
});
