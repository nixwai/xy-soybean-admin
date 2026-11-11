import { beforeEach, describe, expect, it, vi } from 'vitest';

const request = vi.hoisted(() => vi.fn());
vi.mock('@/service/request', () => ({ request }));
import {
  fetchAssetUploadLimits,
  fetchAssetOwners,
  fetchAllAssets,
  fetchAssetFolders,
  uploadAssets
} from '@/service/api/asset';

beforeEach(() => request.mockReset());
describe('素材 API 契约', () => {
  it('owners 独立接口，不依赖管理员列表', async () => {
    request.mockResolvedValue({ error: null, data: { items: [], total: 0 } });
    await fetchAssetOwners();
    expect(request).toHaveBeenCalledWith({ url: '/asset/owners' });
  });
  it('保留 ownerId 与未分类筛选', async () => {
    await fetchAssetFolders('2');
    expect(request).toHaveBeenLastCalledWith({ url: '/asset/folders', params: { ownerId: '2' } });
    await fetchAllAssets({ page: 1, pageSize: 24, ownerId: '2', unclassified: true });
    expect(request).toHaveBeenLastCalledWith({
      url: '/asset/images/all',
      params: { page: 1, pageSize: 24, ownerId: '2', unclassified: true }
    });
  });
  it('全部失败保留业务错误并恢复文件明细', async () => {
    const detail = {
      success: [],
      failed: [{ filename: 'bad.png', reason: '图片处理失败，请检查文件格式' }],
      totalCount: 1,
      successCount: 0
    };
    const error = { response: { data: { code: 400, data: detail } } };
    request.mockResolvedValue({ error, data: null });
    const result = await uploadAssets([new File(['x'], 'bad.png')], 'f', '2');
    expect(result.error).toBe(error);
    expect(result.data).toEqual(detail);
    const data = request.mock.calls[0][0].data as FormData;
    expect(data.get('ownerId')).toBe('2');
    expect(data.get('folderId')).toBe('f');
  });
  it('不把任意错误响应当成上传结果', async () => {
    request.mockResolvedValue({
      error: { response: { data: { data: { success: [], failed: 'invalid' } } } },
      data: null
    });
    expect((await uploadAssets([], null)).data).toBeNull();
  });
});

it('从上传专用配置接口获取限制', async () => {
  request.mockResolvedValueOnce({ error: null, data: { maxFiles: 2, maxFileSize: 100, maxBatchSize: 200 } });
  const result = await fetchAssetUploadLimits();
  expect(request).toHaveBeenLastCalledWith({ url: '/asset/upload-limits' });
  expect(result.data).toEqual({ maxFiles: 2, maxFileSize: 100, maxBatchSize: 200 });
});
