import { onScopeDispose, ref, watch } from 'vue';
import { fetchAssetFolderTree, fetchAssetFolderTreeAll } from '@/service/api';

type MoveSource = Pick<ApiManagement.AssetImage, 'id' | 'folderId'>;
type FolderOption = { label: string; value: string };

/** 生成可选文件夹，排除图片的当前位置但保留其子文件夹。 */
function collectOptions(nodes: ApiManagement.AssetFolderTreeNode[], excludedId: string): FolderOption[] {
  return nodes.flatMap(node => {
    const children = collectOptions(node.children, excludedId);
    return node.id === excludedId ? children : [{ label: node.name, value: node.id }, ...children];
  });
}

/** 读取当前查看范围内的移动目标，忽略已失效的响应。 */
export function useAssetImageMoveOptions(getItem: () => MoveSource | null, getScopeAll: () => boolean) {
  const options = ref<FolderOption[]>([]);
  const loading = ref(false);
  const loadError = ref(false);
  let requestId = 0;

  watch(
    [() => getItem()?.id, () => getItem()?.folderId, getScopeAll],
    () => {
      requestId += 1;
      options.value = [];
      loading.value = false;
      loadError.value = false;
    },
    { flush: 'sync' }
  );

  onScopeDispose(() => {
    requestId += 1;
  });

  async function load() {
    const item = getItem();
    if (!item || loading.value) return false;
    const id = ++requestId;
    const { folderId } = item;
    loading.value = true;
    loadError.value = false;
    try {
      const { data, error } = await (getScopeAll() ? fetchAssetFolderTreeAll() : fetchAssetFolderTree());
      if (id !== requestId) return false;
      if (error || !Array.isArray(data?.owners)) {
        loadError.value = true;
        return false;
      }
      options.value = data.owners.flatMap(group => collectOptions(group.children, folderId));
      return true;
    } catch {
      if (id === requestId) loadError.value = true;
      return false;
    } finally {
      if (id === requestId) loading.value = false;
    }
  }

  return { options, loading, loadError, load };
}
