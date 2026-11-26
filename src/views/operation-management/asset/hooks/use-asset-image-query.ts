import { ref } from 'vue';
import { fetchAssetImageList } from '@/service/api';
import type { AssetTreeOption } from '../typings';

const DEFAULT_PAGE_SIZE = 6;

/** 管理当前文件夹直属图片的分页查询状态。 */
export function useAssetImageQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.AssetImage[]>([]);
  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const total = ref(0);
  const selectedId = ref<string | null>(null);
  let requestToken = 0;

  /** 查询当前文件夹直属图片，并丢弃已过期请求结果。 */
  async function load(node: AssetTreeOption | null, targetPage = page.value): Promise<boolean> {
    if (!node || node.nodeType !== 'folder') {
      requestToken += 1;
      items.value = [];
      total.value = 0;
      selectedId.value = null;
      return true;
    }

    const token = ++requestToken;
    loading.value = true;
    page.value = targetPage;
    try {
      const { data } = await fetchAssetImageList({
        folderId: node.key,
        page: page.value,
        pageSize: pageSize.value
      });
      if (token !== requestToken) return true;
      if (!data) return false;
      items.value = data.items;
      total.value = data.total;
      selectedId.value = data.items[0]?.id ?? null;
      return true;
    } catch {
      if (token === requestToken) {
        items.value = [];
        total.value = 0;
        selectedId.value = null;
      }
      return false;
    } finally {
      if (token === requestToken) loading.value = false;
    }
  }

  /** 切换页码。 */
  async function changePage(node: AssetTreeOption | null, value: number) {
    return load(node, value);
  }

  return {
    items,
    loading,
    page,
    pageSize,
    total,
    selectedId,
    load,
    changePage,
    select
  };

  function select(item: ApiManagement.AssetImage) {
    selectedId.value = item.id;
  }
}
