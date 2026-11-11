import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed } from 'vue';

const api = vi.hoisted(() => ({
  createAssetFolder: vi.fn(),
  updateAssetFolder: vi.fn(),
  deleteAssetFolder: vi.fn(),
  moveAsset: vi.fn(),
  deleteAsset: vi.fn()
}));
vi.mock('@/service/api/asset', () => api);
import { useAssetActions } from '@/views/operation-management/asset/hooks/use-asset-actions';
import { assetAccess } from '@/views/operation-management/asset/utils/asset-policy';

const folder = { id: 'f', ownerId: '2', name: 'old' } as ApiManagement.AssetFolder;
beforeEach(() => vi.resetAllMocks());
describe('素材写操作', () => {
  it('业务错误或非法响应不通知成功，不触发本地刷新', async () => {
    const refreshed = vi.fn();
    const success = vi.fn();
    const actions = useAssetActions(
      computed(() => assetAccess('1', () => true)),
      () => true,
      refreshed,
      success,
      vi.fn()
    );
    api.updateAssetFolder.mockResolvedValueOnce({ error: {}, data: null });
    expect(await actions.rename(folder, 'new')).toBe(false);
    expect(refreshed).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    api.updateAssetFolder.mockResolvedValueOnce({ error: null, data: null });
    expect(await actions.rename(folder, 'new')).toBe(false);
    expect(actions.busy.value).toBe(false);
    api.updateAssetFolder.mockResolvedValueOnce({ error: null, data: {} });
    expect(await actions.rename(folder, 'new')).toBe(false);
  });
  it('停用归属禁止新增，但保留历史重命名删除移动', async () => {
    const actions = useAssetActions(
      computed(() => assetAccess('1', () => true)),
      () => false,
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    expect(await actions.create('new', { ownerId: '2', folderId: null, unclassified: false })).toBe(false);
    expect(api.createAssetFolder).not.toHaveBeenCalled();
    api.updateAssetFolder.mockResolvedValueOnce({ error: null, data: { ...folder, name: 'new' } });
    expect(await actions.rename(folder, 'new')).toBe(true);
    api.deleteAssetFolder.mockResolvedValueOnce({ error: null, data: null });
    expect(await actions.removeFolder(folder)).toBe(true);
    api.moveAsset.mockResolvedValueOnce({ error: null, data: { id: 'i' } });
    expect(await actions.move({ id: 'i', ownerId: '2' } as ApiManagement.Asset, null)).toBe(true);
  });
  it('他人目录移动必须有 folder read-all，无权时不发送请求', async () => {
    const actions = useAssetActions(
      computed(() => assetAccess('1', code => code !== 'asset.folder.read-all')),
      () => true,
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    expect(await actions.move({ id: 'i', ownerId: '2' } as ApiManagement.Asset, 'target')).toBe(false);
    expect(api.moveAsset).not.toHaveBeenCalled();
  });
  it('异常释放锁，删除携带资源归属而非当前选中归属', async () => {
    const actions = useAssetActions(
      computed(() => assetAccess('1', () => true)),
      () => true,
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    api.deleteAsset.mockRejectedValueOnce(new Error('网络错误'));
    expect(await actions.removeImage({ id: 'i', ownerId: '2' } as ApiManagement.Asset)).toBe(false);
    expect(api.deleteAsset).toHaveBeenCalledWith('i', '2');
    expect(actions.busy.value).toBe(false);
  });
});
