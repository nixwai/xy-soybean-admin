import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssetImageQuery } from '@/views/operation-management/asset/hooks/use-asset-image-query';
import { useAssetImageUpload } from '@/views/operation-management/asset/hooks/use-asset-image-upload';
import {
  filterAssetImageFiles,
  formatAssetImageDate,
  formatAssetImageSize,
  formatAssetImageType
} from '@/views/operation-management/asset/utils/asset-image';

const { fetchAssetImageList, fetchAssetImageUpload } = vi.hoisted(() => ({
  fetchAssetImageList: vi.fn(),
  fetchAssetImageUpload: vi.fn()
}));
vi.mock('@/service/api', () => ({
  fetchAssetImageList,
  fetchAssetImageUpload
}));

describe('素材图片查询与展示工具', () => {
  beforeEach(() => {
    fetchAssetImageList.mockReset();
    fetchAssetImageUpload.mockReset();
  });
  it('只使用当前文件夹 ID 查询直属图片', async () => {
    fetchAssetImageList.mockResolvedValueOnce({
      data: {
        items: [{ id: 'image-1', originalName: 'one.png' }],
        total: 1,
        page: 1,
        pageSize: 6,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      error: null
    });
    const { items, load } = useAssetImageQuery();

    await load({
      key: 'folder-1',
      label: '当前目录',
      nodeType: 'folder',
      ownerId: '1'
    });

    expect(fetchAssetImageList).toHaveBeenCalledWith({
      folderId: 'folder-1',
      page: 1,
      pageSize: 6
    });
    expect(items.value).toEqual([{ id: 'image-1', originalName: 'one.png' }]);
  });

  it('切换到账号根节点时清空图片状态且不发请求', async () => {
    const { items, load } = useAssetImageQuery();
    items.value = [{ id: 'image-1' } as never];

    await load({
      key: 'owner:1',
      label: 'admin',
      nodeType: 'owner',
      ownerId: '1'
    });

    expect(fetchAssetImageList).not.toHaveBeenCalled();
    expect(items.value).toEqual([]);
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
