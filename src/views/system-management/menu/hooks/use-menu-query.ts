import { computed, reactive, ref } from 'vue';
import { fetchMenuList } from '@/service/api';
import { createDefaultMenuQuery } from '../config/constants';
import { filterMenuItems } from '../utils/menu-filter';
import type { MenuQueryModel } from '../typings';

/** 菜单列表查询，完整数据加载后由前端完成筛选。 */
export function useMenuQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Menu[]>([]);
  const query = reactive(createDefaultMenuQuery());
  const appliedQuery = ref<MenuQueryModel>(createDefaultMenuQuery());
  const filteredItems = computed(() => filterMenuItems(items.value, appliedQuery.value));

  /** 首次或刷新时拉取完整菜单列表。 */
  async function load() {
    loading.value = true;
    try {
      const result = await fetchMenuList();
      if (!result.error && result.data) items.value = result.data.items;
    } finally {
      loading.value = false;
    }
  }

  /** 应用当前菜单筛选条件，不重新请求完整列表。 */
  function search() {
    appliedQuery.value = { ...query };
  }

  /** 清空菜单筛选条件，不重新请求完整列表。 */
  function reset() {
    const defaults = createDefaultMenuQuery();
    Object.assign(query, defaults);
    appliedQuery.value = defaults;
  }

  return { loading, items, filteredItems, query, load, search, reset };
}
