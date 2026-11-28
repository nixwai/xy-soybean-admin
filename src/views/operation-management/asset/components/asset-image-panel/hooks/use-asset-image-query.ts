import { ref } from 'vue';
import { fetchAssetImageList, fetchAssetImageSearch } from '@/service/api';
import type { AssetImageQueryContext } from '@/views/operation-management/asset/typings';

/** 图片列表查询请求。 */
type AssetImageRequest = () => Promise<{ data: ApiManagement.AssetImagePageResponse | null }>;

const DEFAULT_PAGE_SIZE = 6;

/** 管理素材图片列表的分页查询状态，关键词非空时改用范围搜索。 */
export function useAssetImageQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.AssetImage[]>([]);
  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const total = ref(0);
  const selectedId = ref<string | null>(null);
  let requestToken = 0;

  /** 发起查询并统一处理过期响应、分页状态和异常。 */
  async function runFetch(fetcher: AssetImageRequest, targetPage: number): Promise<boolean> {
    const token = ++requestToken;
    loading.value = true;
    page.value = targetPage;
    try {
      const { data } = await fetcher();
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

  /** 清空查询结果，并让尚未返回的旧请求失效。 */
  function clear() {
    requestToken += 1;
    items.value = [];
    loading.value = false;
    page.value = 1;
    total.value = 0;
    selectedId.value = null;
  }

  /** 按查询上下文读取图片：关键词非空走范围搜索，否则只读取当前文件夹直属图片。 */
  async function load(context: AssetImageQueryContext, targetPage = page.value): Promise<boolean> {
    const keyword = context.keyword.trim();
    const folderId = context.node?.nodeType === 'folder' ? context.node.key : undefined;
    const ownerId = context.node?.nodeType === 'owner' ? context.node.ownerId : undefined;

    if (keyword) {
      return runFetch(
        () =>
          fetchAssetImageSearch({
            keyword,
            folderId,
            ownerId,
            all: context.scopeAll,
            page: targetPage,
            pageSize: pageSize.value
          }),
        targetPage
      );
    }

    // 浏览态只有具体文件夹有直属数据，账号根节点和未选中状态直接清空列表。
    if (!folderId) {
      clear();
      return true;
    }

    return runFetch(() => fetchAssetImageList({ folderId, page: targetPage, pageSize: pageSize.value }), targetPage);
  }

  /** 标记当前选中的图片。 */
  function select(item: ApiManagement.AssetImage) {
    selectedId.value = item.id;
  }

  return {
    items,
    loading,
    page,
    pageSize,
    total,
    selectedId,
    load,
    clear,
    select
  };
}
