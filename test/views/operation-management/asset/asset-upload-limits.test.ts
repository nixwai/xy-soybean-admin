import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ fetchAssetUploadLimits: vi.fn() }));
vi.mock('@/service/api/asset', () => api);
import { useAssetUploadLimits } from '@/views/operation-management/asset/hooks/use-asset-upload-limits';

const limits = { maxFiles: 2, maxFileSize: 100, maxBatchSize: 200 };
describe('上传配置加载', () => {
  it('失败及非法配置不可上传，刷新可恢复', async () => {
    const state = useAssetUploadLimits();
    expect(state.limits.value).toBeNull();
    api.fetchAssetUploadLimits.mockResolvedValueOnce({ error: {}, data: limits });
    await state.reload();
    expect(state.limits.value).toBeNull();
    expect(state.error.value).toContain('重新加载');
    api.fetchAssetUploadLimits.mockResolvedValueOnce({ error: null, data: { ...limits, maxFiles: 0 } });
    await state.reload();
    expect(state.limits.value).toBeNull();
    api.fetchAssetUploadLimits.mockResolvedValueOnce({ error: null, data: limits });
    await state.reload();
    expect(state.limits.value).toEqual(limits);
    expect(state.error.value).toBe('');
    expect(state.loading.value).toBe(false);
  });
  it('刷新期间清除旧配置，异常释放 loading，旧响应不覆盖新配置', async () => {
    const state = useAssetUploadLimits();
    api.fetchAssetUploadLimits.mockResolvedValueOnce({ error: null, data: limits });
    await state.reload();
    let resolveOld!: (value: unknown) => void;
    api.fetchAssetUploadLimits.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveOld = resolve;
        })
    );
    const old = state.reload();
    expect(state.limits.value).toBeNull();
    api.fetchAssetUploadLimits.mockRejectedValueOnce(new Error('断网'));
    await state.reload();
    expect(state.loading.value).toBe(false);
    resolveOld({ error: null, data: limits });
    await old;
    expect(state.limits.value).toBeNull();
    expect(state.error.value).toContain('重新加载');
  });
});
