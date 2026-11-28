import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useAssetImageQuery } from '../hooks/use-asset-image-query';

/** 素材图片面板共享已提交的搜索词、列表和选中的图片。 */
export const useAssetImageStore = defineStore('asset-image-store', () => {
  const keyword = ref('');
  const refreshKey = ref(0);
  const { items, loading, page, pageSize, total, selectedId, select, load, clear: clearQuery } = useAssetImageQuery();
  const selectedImage = computed(() => items.value.find(item => item.id === selectedId.value) ?? null);

  /** 请求列表从第一页重新加载，允许重复提交相同的搜索词。 */
  function refresh() {
    refreshKey.value += 1;
  }

  function commitSearch(value: string) {
    keyword.value = value.trim();
    refresh();
  }

  function clearSelection() {
    selectedId.value = null;
  }

  function refreshAfterRemoval(id: string) {
    if (selectedId.value === id) clearSelection();
    refresh();
  }

  /** 离开面板时清空查询及其未返回的请求。 */
  function reset() {
    keyword.value = '';
    refreshKey.value = 0;
    clearQuery();
  }

  return {
    keyword,
    refreshKey,
    items,
    loading,
    page,
    pageSize,
    total,
    selectedId,
    selectedImage,
    load,
    select,
    clearQuery,
    clearSelection,
    commitSearch,
    refresh,
    refreshAfterRemoval,
    reset
  };
});
