import { computed, ref } from 'vue';
import type { ComputedRef } from 'vue';
import {
  fetchAllAssetFolders,
  fetchAllAssets,
  fetchAssetFolders,
  fetchAssetOwners,
  fetchAssets
} from '@/service/api/asset';
import { imageQuery } from '../utils/asset-policy';
import type { AssetAccess, AssetSelection } from '../typings';

/** 查询状态与失效序号集中管理，切换上下文后旧响应不得写回。 */
export function useAssetQuery(
  selfId: () => string,
  access: ComputedRef<AssetAccess>,
  report: (message: string) => void
) {
  const scope = ref<'mine' | 'all'>('mine');
  const selection = ref<AssetSelection>({ ownerId: selfId(), folderId: null, unclassified: false });
  const owners = ref<ApiManagement.AssetOwner[]>([]);
  const folders = ref<ApiManagement.AssetFolder[]>([]);
  const assets = ref<ApiManagement.Asset[]>([]);
  const loading = ref(false);
  const queryError = ref('');
  const page = ref(1);
  const pageSize = 24;
  const total = ref(0);
  const keyword = ref('');
  let assetSequence = 0;
  let folderSequence = 0;
  let ownerSequence = 0;
  const selectedKey = computed(
    () =>
      selection.value.folderId ||
      (selection.value.ownerId
        ? `${selection.value.unclassified ? 'unclassified' : 'owner'}:${selection.value.ownerId}`
        : 'root')
  );

  async function loadOwners() {
    const sequence = ++ownerSequence;
    if (!access.value.showAll) return;
    try {
      const { data, error } = await fetchAssetOwners();
      if (sequence === ownerSequence && !error && data) owners.value = data.items;
    } catch {
      if (sequence === ownerSequence) report('归属用户加载失败，请重试');
    }
  }

  async function loadFolders() {
    const sequence = ++folderSequence;
    const all = scope.value === 'all';
    try {
      const canAll = all && access.value.readAll('folder');
      if (!canAll && !access.value.read('folder', selfId())) {
        folders.value = [];
        return;
      }
      const { data, error } = canAll ? await fetchAllAssetFolders() : await fetchAssetFolders(selfId());
      if (sequence !== folderSequence || error || !data) return;
      folders.value = data.items.filter(folder => access.value.read('folder', folder.ownerId));
      // 目录被递归删除或其他操作者删除后回到该用户根节点。
      if (selection.value.folderId && !folders.value.some(folder => folder.id === selection.value.folderId)) {
        selection.value = { ...selection.value, folderId: null, unclassified: false };
        page.value = 1;
        await loadAssets();
      }
    } catch {
      if (sequence === folderSequence) report('文件夹加载失败，请重试');
    }
  }

  async function loadAssets(): Promise<void> {
    const sequence = ++assetSequence;
    const ownerId = selection.value.ownerId;
    const all = !ownerId && scope.value === 'all' && access.value.readAll('image');
    if (!all && (!ownerId || !access.value.read('image', ownerId))) {
      assets.value = [];
      total.value = 0;
      loading.value = false;
      queryError.value = '';
      return;
    }
    loading.value = true;
    queryError.value = '';
    try {
      const params = imageQuery({ ...selection.value, page: page.value, pageSize, keyword: keyword.value });
      const { data, error } = ownerId === selfId() ? await fetchAssets(params) : await fetchAllAssets(params);
      if (sequence !== assetSequence) return;
      if (error || !data || !Array.isArray(data.items) || !Number.isSafeInteger(data.total) || data.total < 0) {
        queryError.value = '图片加载失败，请重试';
        return;
      }
      const last = Math.max(1, Math.ceil(data.total / pageSize));
      if (page.value > last) {
        page.value = last;
        await loadAssets();
        return;
      }
      assets.value = data.items.filter(item => access.value.read('image', item.ownerId));
      total.value = data.total;
    } catch {
      if (sequence === assetSequence) {
        queryError.value = '图片加载失败，请重试';
        report(queryError.value);
      }
    } finally {
      if (sequence === assetSequence) loading.value = false;
    }
  }

  const refresh = () => Promise.all([loadFolders(), loadAssets()]);
  async function select(key: string) {
    const folder = folders.value.find(item => item.id === key);
    const ownerId = folder?.ownerId ?? (key.includes(':') ? key.slice(key.indexOf(':') + 1) : null);
    if (folder && !access.value.read('folder', folder.ownerId)) return;
    selection.value = { ownerId, folderId: folder?.id ?? null, unclassified: key.startsWith('unclassified:') };
    assets.value = [];
    total.value = 0;
    page.value = 1;
    await loadAssets();
  }
  async function changeScope(value: 'mine' | 'all') {
    if (value === 'all' && !access.value.showAll) return;
    scope.value = value;
    ++folderSequence;
    folders.value = [];
    selection.value = { ownerId: value === 'mine' ? selfId() : null, folderId: null, unclassified: false };
    assets.value = [];
    total.value = 0;
    page.value = 1;
    await refresh();
  }
  async function search(value: string) {
    keyword.value = value;
    page.value = 1;
    await loadAssets();
  }
  async function changePage(value: number) {
    page.value = value;
    await loadAssets();
  }
  return {
    scope,
    selection,
    owners,
    folders,
    assets,
    loading,
    queryError,
    page,
    pageSize,
    total,
    keyword,
    selectedKey,
    loadOwners,
    loadFolders,
    loadAssets,
    refresh,
    select,
    changeScope,
    search,
    changePage
  };
}
