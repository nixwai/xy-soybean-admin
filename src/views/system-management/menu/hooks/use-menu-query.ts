import { ref } from 'vue';
import { fetchMenuList } from '@/service/api';

/** 菜单列表查询。 */
export function useMenuQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Menu[]>([]);

  async function load() {
    loading.value = true;
    try {
      const result = await fetchMenuList();
      if (!result.error && result.data) items.value = result.data.items;
    } finally {
      loading.value = false;
    }
  }

  return { loading, items, load };
}
