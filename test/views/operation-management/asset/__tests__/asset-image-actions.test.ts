import { beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import { useAssetImageDelete } from '@/views/operation-management/asset/components/asset-image-panel/hooks/use-asset-image-delete';
import { useAssetImageMove } from '@/views/operation-management/asset/components/asset-image-panel/hooks/use-asset-image-move';
import { useAssetImageMoveOptions } from '@/views/operation-management/asset/components/asset-image-panel/hooks/use-asset-image-move-options';
import { useAssetImageRename } from '@/views/operation-management/asset/components/asset-image-panel/hooks/use-asset-image-rename';

const api = vi.hoisted(() => ({
  fetchAssetFolderTree: vi.fn(),
  fetchAssetFolderTreeAll: vi.fn(),
  fetchAssetImageUpdate: vi.fn(),
  fetchAssetImageMove: vi.fn(),
  fetchAssetImageSoftDelete: vi.fn()
}));
vi.mock('@/service/api', () => api);

const image = { id: '1', folderId: '10', originalName: 'banner.2026.png' };
const other = { ...image, id: '2', folderId: '12', originalName: 'next.png' };
const folders = {
  owners: [
    {
      owner: { id: '1', username: 'admin' },
      children: [
        { id: '10', name: '当前文件夹', children: [{ id: '11', name: '子文件夹', children: [] }] },
        { id: '12', name: '其他文件夹', children: [] }
      ]
    }
  ]
};

describe('素材图片详情操作', () => {
  beforeEach(() => vi.resetAllMocks());

  it('重命名保留原接口载荷，失败时保留表单供重试', async () => {
    const success = vi.fn();
    const rename = useAssetImageRename(success);
    rename.open(image);
    expect(rename.name.value).toBe('banner.2026');
    rename.name.value = '  新图.2026  ';
    api.fetchAssetImageUpdate
      .mockResolvedValueOnce({ data: null, error: {} })
      .mockResolvedValueOnce({ data: image, error: null });
    await rename.submit();
    expect(rename.visible.value).toBe(true);
    expect(success).not.toHaveBeenCalled();
    await rename.submit();
    expect(api.fetchAssetImageUpdate).toHaveBeenLastCalledWith({ id: '1', originalName: '新图.2026' });
    expect(rename.visible.value).toBe(false);
    expect(success).toHaveBeenCalledOnce();
  });

  it('关闭重命名弹窗后不能提交旧目标，再打开时重新初始化表单', async () => {
    const rename = useAssetImageRename(vi.fn());
    rename.open(image);
    rename.name.value = '未保存的名称';
    rename.close();
    await rename.submit();
    expect(api.fetchAssetImageUpdate).not.toHaveBeenCalled();

    rename.open(other);
    expect(rename.name.value).toBe('next');
    expect(rename.visible.value).toBe(true);
  });

  it('切换图片后丢弃过期的文件夹选项，重试仍可加载并保留子文件夹', async () => {
    const item = ref(image);
    const scopeAll = ref(false);
    const scope = effectScope();
    const options = scope.run(() =>
      useAssetImageMoveOptions(
        () => item.value,
        () => scopeAll.value
      )
    )!;
    let resolve!: (value: unknown) => void;
    api.fetchAssetFolderTree.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      })
    );
    const old = options.load();
    item.value = other;
    scopeAll.value = true;
    api.fetchAssetFolderTreeAll.mockResolvedValueOnce({ data: folders, error: null });
    expect(await options.load()).toBe(true);
    resolve({ data: folders, error: null });
    expect(await old).toBe(false);
    expect(options.options.value).toEqual([
      { label: '当前文件夹', value: '10' },
      { label: '子文件夹', value: '11' }
    ]);
    scope.stop();
  });

  it('移动选项在请求期间加载，失败可重试，关闭时忽略迟到结果', async () => {
    const item = ref<typeof image | null>(image);
    const scope = effectScope();
    const moveOptions = scope.run(() =>
      useAssetImageMoveOptions(
        () => item.value,
        () => false
      )
    )!;
    try {
      api.fetchAssetFolderTree.mockRejectedValueOnce(new Error('network'));
      const failed = moveOptions.load();
      expect(moveOptions.loading.value).toBe(true);
      expect(await failed).toBe(false);
      expect(moveOptions.loading.value).toBe(false);
      expect(moveOptions.loadError.value).toBe(true);

      let resolve!: (value: unknown) => void;
      api.fetchAssetFolderTree.mockReturnValueOnce(
        new Promise(done => {
          resolve = done;
        })
      );
      const pending = moveOptions.load();
      expect(moveOptions.loadError.value).toBe(false);
      item.value = null;
      resolve({ data: folders, error: null });
      expect(await pending).toBe(false);
      expect(moveOptions.loading.value).toBe(false);
      expect(moveOptions.options.value).toEqual([]);

      item.value = image;
      api.fetchAssetFolderTree.mockResolvedValueOnce({ data: folders, error: null });
      expect(await moveOptions.load()).toBe(true);
      expect(moveOptions.options.value).toContainEqual({ label: '子文件夹', value: '11' });
    } finally {
      scope.stop();
    }
  });

  it('未选目标或目标为当前文件夹时不提交，移动成功才刷新', async () => {
    const success = vi.fn();
    const move = useAssetImageMove(success);
    await move.submit(image, null);
    await move.submit(image, image.folderId);
    expect(api.fetchAssetImageMove).not.toHaveBeenCalled();

    api.fetchAssetImageMove
      .mockResolvedValueOnce({ data: null, error: {} })
      .mockResolvedValueOnce({ data: other, error: null });
    await move.submit(image, '12');
    expect(success).not.toHaveBeenCalled();
    await move.submit(image, '12');
    expect(api.fetchAssetImageMove).toHaveBeenLastCalledWith({ id: '1', folderId: '12' });
    expect(success).toHaveBeenCalledExactlyOnceWith('1');
  });

  it('删除确认只提交打开时的目标，失败可重新确认', async () => {
    const success = vi.fn();
    const confirm = vi.fn().mockReturnValue({ destroy: vi.fn() });
    const remove = useAssetImageDelete(success, confirm);
    remove.open(image);
    remove.open(other);
    expect(api.fetchAssetImageSoftDelete).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledOnce();
    const { onPositiveClick } = confirm.mock.calls[0][0];
    api.fetchAssetImageSoftDelete.mockResolvedValueOnce({ error: {} }).mockResolvedValueOnce({ error: null });
    expect(await onPositiveClick()).toBe(false);
    expect(success).not.toHaveBeenCalled();
    await onPositiveClick();
    expect(api.fetchAssetImageSoftDelete).toHaveBeenNthCalledWith(2, { id: '1' });
    expect(success).toHaveBeenCalledExactlyOnceWith('1');
  });
});
