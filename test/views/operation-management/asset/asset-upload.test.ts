import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ uploadAssets: vi.fn() }));
vi.mock('@/service/api/asset', () => api);
import { useAssetUpload as createUpload } from '@/views/operation-management/asset/hooks/use-asset-upload';

const defaultLimits = { maxFiles: 50, maxFileSize: 50 * 1024 * 1024, maxBatchSize: 64 * 1024 * 1024 };
const useAssetUpload = (allowed: Parameters<typeof createUpload>[0], changed: Parameters<typeof createUpload>[1]) =>
  createUpload(allowed, changed, () => defaultLimits);

const file = (name: string) => new File(['x'], name, { type: 'image/png' });
describe('上传会话', () => {
  it('失败重试保留原始目录与归属，成功项不重复上传', async () => {
    api.uploadAssets.mockResolvedValueOnce({
      error: null,
      data: {
        success: [{ originalName: 'ok.png' }],
        failed: [{ filename: 'bad.png', reason: '错误原因' }],
        totalCount: 2,
        successCount: 1
      }
    });
    const changed = vi.fn();
    const context = { ownerId: '2', folderId: 'f' as string | null };
    const upload = useAssetUpload(() => true, changed);
    await upload.add([file('ok.png'), file('bad.png')], context);
    expect(upload.entries.value.map(item => item.status)).toEqual(['success', 'failed']);
    expect(upload.entries.value[1].reason).toBe('错误原因');
    context.ownerId = '3';
    context.folderId = 'other';
    api.uploadAssets.mockResolvedValueOnce({
      error: null,
      data: { success: [{ originalName: 'bad.png' }], failed: [], totalCount: 1, successCount: 1 }
    });
    await upload.retry();
    expect(api.uploadAssets.mock.lastCall?.slice(1)).toEqual(['f', '2']);
    expect(api.uploadAssets.mock.lastCall?.[0].map((item: File) => item.name)).toEqual(['bad.png']);
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it('异常恢复 busy，业务错误明细可见，权限撤回不重试', async () => {
    let allowed = true;
    const upload = useAssetUpload(() => allowed, vi.fn());
    api.uploadAssets.mockRejectedValueOnce(new Error('网络错误'));
    await upload.add([file('bad.png')], { ownerId: '2', folderId: null });
    expect(upload.busy.value).toBe(false);
    expect(upload.entries.value[0].reason).toBe('网络错误');
    api.uploadAssets.mockResolvedValueOnce({
      error: {},
      data: { success: [], failed: [{ filename: 'bad.png', reason: '图片格式错误' }], totalCount: 1, successCount: 0 }
    });
    await upload.retry();
    expect(upload.entries.value[0].reason).toBe('图片格式错误');
    allowed = false;
    const calls = api.uploadAssets.mock.calls.length;
    await upload.retry();
    expect(api.uploadAssets.mock.calls.length).toBe(calls);
  });
  it('无有效结果不可误报成功', async () => {
    const changed = vi.fn();
    const upload = useAssetUpload(() => true, changed);
    api.uploadAssets.mockResolvedValueOnce({ error: null, data: null });
    await upload.add([file('x.png')], { ownerId: '1', folderId: null });
    expect(upload.entries.value[0].status).toBe('failed');
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('上传预算', () => {
  it('51 文件按小批上传，单请求不超过 3 文件', async () => {
    api.uploadAssets.mockReset();
    api.uploadAssets.mockImplementation(async (files: File[]) => ({
      error: null,
      data: {
        success: files.map(f => ({ originalName: f.name })),
        failed: [],
        totalCount: files.length,
        successCount: files.length
      }
    }));
    const upload = useAssetUpload(() => true, vi.fn());
    await upload.add(
      Array.from({ length: 51 }, (_, i) => file(`${i}.png`)),
      { ownerId: '1', folderId: null }
    );
    expect(api.uploadAssets.mock.calls).toHaveLength(17);
    expect(api.uploadAssets.mock.calls.every(call => call[0].length <= 3)).toBe(true);
  });
  it('50MiB 合法文件可上传，64MiB 请求预算与超限单文件提前校验', async () => {
    api.uploadAssets.mockReset();
    api.uploadAssets.mockImplementation(async (files: File[]) => ({
      error: null,
      data: {
        success: files.map(f => ({ originalName: f.name })),
        failed: [],
        totalCount: files.length,
        successCount: files.length
      }
    }));
    const sized = (name: string, mb: number) => {
      const f = file(name);
      Object.defineProperty(f, 'size', { value: mb * 1024 * 1024 });
      return f;
    };
    const upload = useAssetUpload(() => true, vi.fn());
    await upload.add([sized('a.png', 50), sized('b.png', 20), sized('huge.png', 51)], { ownerId: '1', folderId: null });
    expect(api.uploadAssets.mock.calls).toHaveLength(2);
    expect(
      api.uploadAssets.mock.calls.every(
        call => call[0].reduce((sum: number, f: File) => sum + f.size, 0) <= 64 * 1024 * 1024
      )
    ).toBe(true);
    expect(upload.entries.value.find(entry => entry.file.name === 'huge.png')?.reason).toContain('50MiB');
    expect(upload.entries.value.find(entry => entry.file.name === 'a.png')?.status).toBe('success');
  });
});

it('同名文件分批避免错配，重试后不再次发送已成功文件', async () => {
  api.uploadAssets.mockReset();
  api.uploadAssets.mockResolvedValueOnce({
    error: null,
    data: { success: [{ originalName: 'same.png' }], failed: [], totalCount: 1, successCount: 1 }
  });
  api.uploadAssets.mockResolvedValueOnce({
    error: {},
    data: { success: [], failed: [{ filename: 'same.png', reason: '第二张失败' }], totalCount: 1, successCount: 0 }
  });
  const upload = useAssetUpload(() => true, vi.fn());
  await upload.add([file('same.png'), file('same.png')], { ownerId: '2', folderId: null });
  expect(upload.entries.value.map(item => item.status)).toEqual(['success', 'failed']);
  expect(upload.entries.value[1].reason).toBe('第二张失败');
  expect(api.uploadAssets.mock.calls).toHaveLength(2);
});

describe('服务端动态上传配置', () => {
  it('配置未就绪禁止新增和重试，已有失败项保持原上下文', async () => {
    let limits: ApiManagement.AssetUploadLimits | null = null;
    api.uploadAssets.mockReset();
    const upload = createUpload(
      () => true,
      vi.fn(),
      () => limits
    );
    await upload.add([file('x.png')], { ownerId: '2', folderId: 'original' });
    expect(upload.entries.value).toEqual([]);
    expect(api.uploadAssets).not.toHaveBeenCalled();
    limits = { maxFiles: 1, maxFileSize: 100, maxBatchSize: 100 };
    api.uploadAssets.mockRejectedValueOnce(new Error('失败'));
    await upload.add([file('x.png')], { ownerId: '2', folderId: 'original' });
    limits = null;
    await upload.retry();
    expect(api.uploadAssets).toHaveBeenCalledTimes(1);
    expect(upload.entries.value[0]).toMatchObject({ ownerId: '2', folderId: 'original', status: 'failed' });
  });
  it('数量取 min(3,maxFiles)，同时遵守动态文件和批次字节上限', async () => {
    api.uploadAssets.mockReset();
    api.uploadAssets.mockImplementation(async (files: File[]) => ({
      error: null,
      data: {
        success: files.map(f => ({ originalName: f.name })),
        failed: [],
        totalCount: files.length,
        successCount: files.length
      }
    }));
    const upload = createUpload(
      () => true,
      vi.fn(),
      () => ({ maxFiles: 1, maxFileSize: 4, maxBatchSize: 3 })
    );
    await upload.add(
      [file('a.png'), file('b.png'), new File(['12345'], 'large.png'), new File(['1234'], 'batch-too-large.png')],
      { ownerId: '1', folderId: null }
    );
    expect(api.uploadAssets).toHaveBeenCalledTimes(2);
    expect(api.uploadAssets.mock.calls.every(call => call[0].length === 1)).toBe(true);
    expect(upload.entries.value.map(item => item.status)).toEqual(['success', 'success', 'failed', 'failed']);
  });
});

it('配置刷新后重试按新限制重新校验，目标不随 UI 选择变化，权限撤回不发请求', async () => {
  api.uploadAssets.mockReset();
  let limits = { maxFiles: 1, maxFileSize: 1, maxBatchSize: 2 };
  let allowed = true;
  const checked = vi.fn(
    (ownerId: string, folderId: string | null) => allowed && ownerId === '2' && folderId === 'original'
  );
  const upload = createUpload(checked, vi.fn(), () => limits);
  const context = { ownerId: '2', folderId: 'original' };
  await upload.add([new File(['12'], 'invalid.png')], context);
  expect(upload.entries.value[0].status).toBe('failed');
  expect(api.uploadAssets).not.toHaveBeenCalled();
  context.ownerId = '9';
  context.folderId = 'elsewhere';
  limits = { maxFiles: 1, maxFileSize: 2, maxBatchSize: 2 };
  allowed = false;
  await upload.retry();
  expect(api.uploadAssets).not.toHaveBeenCalled();
  expect(checked).toHaveBeenLastCalledWith('2', 'original');
  allowed = true;
  api.uploadAssets.mockResolvedValueOnce({
    error: null,
    data: { success: [{ originalName: 'invalid.png' }], failed: [], totalCount: 1, successCount: 1 }
  });
  await upload.retry();
  expect(api.uploadAssets.mock.lastCall?.slice(1)).toEqual(['original', '2']);
  expect(upload.entries.value[0].status).toBe('success');
  await upload.retry();
  expect(api.uploadAssets).toHaveBeenCalledTimes(1);
});
