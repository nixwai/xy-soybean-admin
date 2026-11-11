import { ref } from 'vue';
import type { ComputedRef } from 'vue';
import { createAssetFolder, deleteAsset, deleteAssetFolder, moveAsset, updateAssetFolder } from '@/service/api/asset';
import type { AssetAccess, AssetSelection } from '../typings';

/** 写操作只在明确成功后触发刷新，删除成功响应允许 data=null。 */
export function useAssetActions(
  access: ComputedRef<AssetAccess>,
  active: (ownerId: string) => boolean,
  changed: () => void | Promise<unknown>,
  success: (message: string) => void,
  report: (message: string) => void
) {
  const busy = ref(false);
  async function execute(operation: () => Promise<{ error: unknown; data: unknown }>, text: string, needsData = true) {
    if (busy.value) return false;
    busy.value = true;
    try {
      const result = await operation();
      if (
        result.error ||
        (needsData &&
          (!result.data ||
            typeof result.data !== 'object' ||
            !('id' in result.data) ||
            typeof result.data.id !== 'string'))
      )
        return false;
      success(text);
      await changed();
      return true;
    } catch {
      report('操作失败，请重试');
      return false;
    } finally {
      busy.value = false;
    }
  }
  function create(name: string, selection: AssetSelection) {
    const ownerId = selection.ownerId;
    if (!ownerId || !active(ownerId) || !access.value.write('folder', 'create', ownerId)) return Promise.resolve(false);
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      report('文件夹名称须为 1～128 个字符');
      return Promise.resolve(false);
    }
    return execute(() => createAssetFolder({ name: trimmed, parentId: selection.folderId, ownerId }), '文件夹已创建');
  }
  function rename(folder: ApiManagement.AssetFolder, name: string) {
    if (!access.value.write('folder', 'update', folder.ownerId)) return Promise.resolve(false);
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      report('文件夹名称须为 1～128 个字符');
      return Promise.resolve(false);
    }
    return execute(
      () => updateAssetFolder({ id: folder.id, name: trimmed, ownerId: folder.ownerId }),
      '文件夹已重命名'
    );
  }
  function removeFolder(folder: ApiManagement.AssetFolder) {
    if (!access.value.write('folder', 'delete', folder.ownerId)) return Promise.resolve(false);
    return execute(() => deleteAssetFolder(folder.id, folder.ownerId), '目录树已删除，图片已移至未分类', false);
  }
  function move(asset: ApiManagement.Asset, folderId: string | null) {
    if (!access.value.write('image', 'move', asset.ownerId) || !access.value.target(asset.ownerId, folderId))
      return Promise.resolve(false);
    return execute(() => moveAsset(asset.id, folderId, asset.ownerId), '图片已移动');
  }
  function removeImage(asset: ApiManagement.Asset) {
    if (!access.value.write('image', 'delete', asset.ownerId)) return Promise.resolve(false);
    return execute(() => deleteAsset(asset.id, asset.ownerId), '图片已删除', false);
  }
  return { busy, create, rename, removeFolder, move, removeImage };
}
