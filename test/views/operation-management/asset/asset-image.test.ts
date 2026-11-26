import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssetImageQuery } from '@/views/operation-management/asset/hooks/use-asset-image-query';
import { useAssetImageUpload } from '@/views/operation-management/asset/hooks/use-asset-image-upload';
import type { AssetTreeOption } from '@/views/operation-management/asset/typings';
import {
  filterAssetImageFiles,
  formatAssetImageDate,
  formatAssetImageSize,
  formatAssetImageType
} from '@/views/operation-management/asset/utils/asset-image';

const { fetchAssetImageList, fetchAssetImageSearch, fetchAssetImageUpload } = vi.hoisted(() => ({
  fetchAssetImageList: vi.fn(),
  fetchAssetImageSearch: vi.fn(),
  fetchAssetImageUpload: vi.fn()
}));
vi.mock('@/service/api', () => ({
  fetchAssetImageList,
  fetchAssetImageSearch,
  fetchAssetImageUpload
}));

const folderNode: AssetTreeOption = { key: 'folder-1', label: '当前目录', nodeType: 'folder', ownerId: '1' };
const ownerNode: AssetTreeOption = { key: 'owner:2', label: '账号B', nodeType: 'owner', ownerId: '2' };

/** 构造图片分页响应。 */
function createPageResponse(items: ApiManagement.AssetImage[], page = 1) {
  const pageSize = 6;
  const totalPages = Math.ceil(items.length / pageSize);
  return {
    data: {
      items,
      total: items.length,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    error: null
  };
}

describe('素材图片查询与展示工具', () => {
  beforeEach(() => {
    fetchAssetImageList.mockReset();
    fetchAssetImageSearch.mockReset();
    fetchAssetImageUpload.mockReset();
  });

  it('浏览态只使用当前文件夹 ID 查询直属图片', async () => {
    fetchAssetImageList.mockResolvedValueOnce(
      createPageResponse([{ id: 'image-1', originalName: 'one.png' } as never])
    );
    const { items, load } = useAssetImageQuery();

    await load({ node: folderNode, scopeAll: false, keyword: '' });

    expect(fetchAssetImageList).toHaveBeenCalledWith({ folderId: 'folder-1', page: 1, pageSize: 6 });
    expect(fetchAssetImageSearch).not.toHaveBeenCalled();
    expect(items.value).toEqual([{ id: 'image-1', originalName: 'one.png' }]);
  });

  it('切换到账号根节点且无关键词时清空图片状态且不发请求', async () => {
    const { items, load } = useAssetImageQuery();
    items.value = [{ id: 'image-1' } as never];

    await load({ node: ownerNode, scopeAll: true, keyword: '' });

    expect(fetchAssetImageList).not.toHaveBeenCalled();
    expect(fetchAssetImageSearch).not.toHaveBeenCalled();
    expect(items.value).toEqual([]);
  });

  it('未选中文件夹且无关键词时不发请求', async () => {
    const { load } = useAssetImageQuery();

    await load({ node: null, scopeAll: false, keyword: '' });

    expect(fetchAssetImageList).not.toHaveBeenCalled();
    expect(fetchAssetImageSearch).not.toHaveBeenCalled();
  });

  it('关键词非空时改用搜索接口并限定在选中文件夹', async () => {
    fetchAssetImageSearch.mockResolvedValueOnce(createPageResponse([{ id: 'image-1' } as never]));
    const { items, load, total } = useAssetImageQuery();

    await load({ node: folderNode, scopeAll: false, keyword: '  logo  ' }, 2);

    expect(fetchAssetImageList).not.toHaveBeenCalled();
    expect(fetchAssetImageSearch).toHaveBeenCalledWith({
      keyword: 'logo',
      folderId: 'folder-1',
      ownerId: undefined,
      all: false,
      page: 2,
      pageSize: 6
    });
    expect(items.value).toEqual([{ id: 'image-1' }]);
    expect(total.value).toBe(1);
  });

  it('未选中文件夹时按当前查看范围搜索全部素材', async () => {
    const { load } = useAssetImageQuery();
    fetchAssetImageSearch.mockResolvedValueOnce(createPageResponse([]));

    await load({ node: null, scopeAll: false, keyword: 'logo' });
    expect(fetchAssetImageSearch).toHaveBeenLastCalledWith({
      keyword: 'logo',
      folderId: undefined,
      ownerId: undefined,
      all: false,
      page: 1,
      pageSize: 6
    });

    fetchAssetImageSearch.mockResolvedValueOnce(createPageResponse([]));
    await load({ node: null, scopeAll: true, keyword: 'logo' });
    expect(fetchAssetImageSearch).toHaveBeenLastCalledWith({
      keyword: 'logo',
      folderId: undefined,
      ownerId: undefined,
      all: true,
      page: 1,
      pageSize: 6
    });
  });

  it('选中账号根节点时按该账号范围搜索', async () => {
    fetchAssetImageSearch.mockResolvedValueOnce(createPageResponse([]));
    const { load } = useAssetImageQuery();

    await load({ node: ownerNode, scopeAll: true, keyword: 'logo' });

    expect(fetchAssetImageSearch).toHaveBeenCalledWith({
      keyword: 'logo',
      folderId: undefined,
      ownerId: '2',
      all: true,
      page: 1,
      pageSize: 6
    });
  });

  it('翻页时保持搜索条件不退回直属查询', async () => {
    fetchAssetImageSearch.mockResolvedValue(createPageResponse([], 3));
    const { load } = useAssetImageQuery();

    await load({ node: folderNode, scopeAll: true, keyword: 'logo' }, 3);

    expect(fetchAssetImageSearch).toHaveBeenLastCalledWith({
      keyword: 'logo',
      folderId: 'folder-1',
      ownerId: undefined,
      all: true,
      page: 3,
      pageSize: 6
    });
  });

  it('搜索接口失败时保留原列表并返回失败', async () => {
    fetchAssetImageSearch.mockResolvedValueOnce({ data: null, error: {} });
    const { items, load } = useAssetImageQuery();
    items.value = [{ id: 'stale' } as never];

    const success = await load({ node: folderNode, scopeAll: false, keyword: 'logo' });

    expect(success).toBe(false);
    expect(items.value).toEqual([{ id: 'stale' }]);
  });

  it('批量上传时将目标文件夹和全部图片交给素材上传接口', async () => {
    fetchAssetImageUpload.mockResolvedValueOnce({
      data: { success: [], failed: [], totalCount: 2, successCount: 2 },
      error: null
    });
    const { upload } = useAssetImageUpload();
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.jpg', { type: 'image/jpeg' })
    ];

    await upload('folder-1', files);

    expect(fetchAssetImageUpload).toHaveBeenCalledWith('folder-1', files);
  });

  it('只保留项目后端支持的图片类型', () => {
    const files = [
      new File(['jpg'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['png'], 'b.png', { type: 'image/png' }),
      new File(['txt'], 'c.txt', { type: 'text/plain' })
    ];

    expect(filterAssetImageFiles(files).map(file => file.name)).toEqual(['a.jpg', 'b.png']);
  });

  it('格式化图片大小和上传时间', () => {
    expect(formatAssetImageSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatAssetImageDate('2024-08-12T14:32:00.000Z')).toMatch(/2024/);
  });

  it('格式化图片类型名称', () => {
    expect(formatAssetImageType({ mimeType: 'image/jpeg' } as ApiManagement.AssetImage)).toBe('JPG');
  });
});
