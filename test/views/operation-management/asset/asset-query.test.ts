import { describe, expect, it, vi } from 'vitest';
import { computed } from 'vue';

const api = vi.hoisted(() => ({
  fetchAssetOwners: vi.fn(),
  fetchAssetFolders: vi.fn(),
  fetchAllAssetFolders: vi.fn(),
  fetchAssets: vi.fn(),
  fetchAllAssets: vi.fn()
}));
vi.mock('@/service/api/asset', () => api);
import { useAssetQuery } from '@/views/operation-management/asset/hooks/use-asset-query';
import { assetAccess } from '@/views/operation-management/asset/utils/asset-policy';

const access = computed(() => assetAccess('1', () => true));
const make = () => useAssetQuery(() => '1', access, vi.fn());
const result = (id: string, total = 1) => ({ error: null, data: { items: [{ id }], total } });

describe('素材查询隔离', () => {
  it('后发请求胜出，旧请求结束不提前清除 loading', async () => {
    const query = make();
    let first!: (value: unknown) => void;
    api.fetchAssets.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          first = resolve;
        })
    );
    const old = query.loadAssets();
    api.fetchAssets.mockResolvedValueOnce(result('new'));
    await query.loadAssets();
    first(result('old'));
    await old;
    expect(query.assets.value[0].id).toBe('new');
    expect(query.loading.value).toBe(false);
  });
  it('筛选重置页码，删除末页刷新时退页', async () => {
    const query = make();
    query.page.value = 3;
    api.fetchAssets.mockResolvedValueOnce(result('filtered'));
    await query.search('keyword');
    expect(query.page.value).toBe(1);
    query.page.value = 3;
    api.fetchAssets.mockResolvedValueOnce({ error: null, data: { items: [], total: 24 } });
    api.fetchAssets.mockResolvedValueOnce(result('last', 24));
    await query.loadAssets();
    expect(query.page.value).toBe(1);
    expect(query.assets.value[0].id).toBe('last');
  });
  it('没有他人 image all 时选择他人目录不请求图片', async () => {
    const limited = computed(() =>
      assetAccess('1', code => ['asset.folder.read-all', 'asset.folder.read', 'asset.image.read'].includes(code))
    );
    const query = useAssetQuery(() => '1', limited, vi.fn());
    query.folders.value = [{ id: 'f', ownerId: '2' }] as ApiManagement.AssetFolder[];
    const calls = api.fetchAllAssets.mock.calls.length;
    await query.select('f');
    expect(api.fetchAllAssets.mock.calls.length).toBe(calls);
    expect(query.assets.value).toEqual([]);
  });
  it('错误结果不覆盖现有数据，异常恢复 loading', async () => {
    const query = make();
    api.fetchAssets.mockResolvedValueOnce(result('old'));
    await query.loadAssets();
    api.fetchAssets.mockResolvedValueOnce({ error: {}, data: null });
    await query.loadAssets();
    expect(query.assets.value[0].id).toBe('old');
    expect(query.queryError.value).toBe('图片加载失败，请重试');
    api.fetchAssets.mockRejectedValueOnce(new Error('断网'));
    await query.loadAssets();
    expect(query.loading.value).toBe(false);
  });
});

describe('查询响应边界', () => {
  it('非法分页响应不得覆盖已有列表', async () => {
    const query = make();
    api.fetchAssets.mockResolvedValueOnce(result('old'));
    await query.loadAssets();
    api.fetchAssets.mockResolvedValueOnce({ error: null, data: { items: 'invalid', total: -1 } });
    await query.loadAssets();
    expect(query.assets.value[0].id).toBe('old');
    expect(query.total.value).toBe(1);
  });
  it('all 目录请求无 image all 时只请求自己的图片', async () => {
    const limited = computed(() =>
      assetAccess('1', code => ['asset.folder.read-all', 'asset.image.read'].includes(code))
    );
    const query = useAssetQuery(() => '1', limited, vi.fn());
    api.fetchAllAssetFolders.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
    await query.changeScope('all');
    expect(api.fetchAllAssetFolders).toHaveBeenCalled();
    const calls = api.fetchAssets.mock.calls.length;
    await query.select('owner:2');
    expect(api.fetchAssets.mock.calls.length).toBe(calls);
    expect(query.assets.value).toEqual([]);
  });
});

describe('全量浏览', () => {
  it('全部根节点使用 images/all 且不传 ownerId，不影响创建目标必须明确', async () => {
    const query = make();
    api.fetchAllAssetFolders.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
    api.fetchAllAssets.mockResolvedValueOnce(result('all'));
    await query.changeScope('all');
    expect(api.fetchAllAssets.mock.lastCall?.[0].ownerId).toBeUndefined();
    expect(query.assets.value[0].id).toBe('all');
    expect(query.selection.value.ownerId).toBeNull();
  });
  it('只有 folder all 的全部根节点不加载他人图片', async () => {
    const query = useAssetQuery(
      () => '1',
      computed(() => assetAccess('1', code => code === 'asset.folder.read-all')),
      vi.fn()
    );
    api.fetchAllAssetFolders.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
    const calls = api.fetchAllAssets.mock.calls.length;
    await query.changeScope('all');
    expect(api.fetchAllAssets.mock.calls.length).toBe(calls);
  });
});

it('image-only all 不加载他人目录，选择其他用户仅查询该用户图片', async () => {
  const limited = computed(() =>
    assetAccess('1', code => ['asset.folder.read', 'asset.image.read-all'].includes(code))
  );
  const query = useAssetQuery(() => '1', limited, vi.fn());
  api.fetchAssetFolders.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
  api.fetchAllAssets.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
  const before = api.fetchAllAssetFolders.mock.calls.length;
  await query.changeScope('all');
  expect(api.fetchAllAssetFolders.mock.calls.length).toBe(before);
  api.fetchAllAssets.mockResolvedValueOnce({ error: null, data: { items: [{ id: 'image', ownerId: '2' }], total: 1 } });
  await query.select('unclassified:2');
  expect(api.fetchAllAssets.mock.lastCall?.[0]).toMatchObject({ ownerId: '2', unclassified: true });
  expect(api.fetchAllAssets.mock.lastCall?.[0].folderId).toBeUndefined();
});

it('切换范围后旧目录响应失效', async () => {
  const query = make();
  let resolveOld!: (value: unknown) => void;
  api.fetchAssetFolders.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveOld = resolve;
      })
  );
  const old = query.loadFolders();
  api.fetchAllAssetFolders.mockResolvedValueOnce({
    error: null,
    data: { items: [{ id: 'new', ownerId: '2' }], total: 1 }
  });
  api.fetchAllAssets.mockResolvedValueOnce({ error: null, data: { items: [], total: 0 } });
  await query.changeScope('all');
  resolveOld({ error: null, data: { items: [{ id: 'old', ownerId: '1' }], total: 1 } });
  await old;
  expect(query.folders.value[0].id).toBe('new');
});
