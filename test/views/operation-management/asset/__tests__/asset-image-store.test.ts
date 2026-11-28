import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAssetImageStore } from '@/views/operation-management/asset/components/asset-image-panel/store/asset-image-store';

const api = vi.hoisted(() => ({ fetchAssetImageList: vi.fn(), fetchAssetImageSearch: vi.fn() }));
vi.mock('@/service/api', () => api);

const context = {
  node: { key: '1', label: '目录', ownerId: '2', nodeType: 'folder' as const },
  scopeAll: false,
  keyword: ''
};
const images = [{ id: '1' }, { id: '2' }] as ApiManagement.AssetImage[];
const response = { data: { items: images, total: images.length } };

describe('素材图片共享状态', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it('提交搜索才更新共享关键词，同一关键词可再次刷新', () => {
    const store = useAssetImageStore();
    store.commitSearch('  图片  ');
    const revision = store.refreshKey;
    store.commitSearch('图片');
    expect(store.keyword).toBe('图片');
    expect(store.refreshKey).toBe(revision + 1);
  });

  it('详情和列表共享选中项，操作其他图片不会清除当前选中项', async () => {
    api.fetchAssetImageList.mockResolvedValueOnce(response);
    const store = useAssetImageStore();
    await store.load(context);
    expect(store.selectedImage?.id).toBe('1');
    store.select(images[1]);
    expect(store.selectedImage?.id).toBe('2');
    store.refreshAfterRemoval('1');
    expect(store.selectedImage?.id).toBe('2');
    store.refreshAfterRemoval('2');
    expect(store.selectedImage).toBeNull();
    expect(store.refreshKey).toBe(2);
  });

  it('离开页面重置共享状态，迟到的请求不能恢复旧列表', async () => {
    const store = useAssetImageStore();
    let resolve!: (result: typeof response) => void;
    api.fetchAssetImageSearch.mockReturnValueOnce(
      new Promise<typeof response>(done => {
        resolve = done;
      })
    );
    store.commitSearch('图片');
    const pending = store.load({ ...context, keyword: store.keyword });
    store.reset();
    resolve(response);
    await pending;
    expect(store.keyword).toBe('');
    expect(store.refreshKey).toBe(0);
    expect(store.loading).toBe(false);
    expect(store.items).toEqual([]);
    expect(store.selectedImage).toBeNull();
  });
});
