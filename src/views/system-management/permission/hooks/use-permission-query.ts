import { ref } from 'vue';
import { fetchPermissionList } from '@/service/api';

/** 权限列表查询。 */
export function usePermissionQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Permission[]>([]);

  async function load() {
    loading.value = true;
    try {
      const result = await fetchPermissionList();
      if (!result.error && result.data) items.value = result.data.items;
    } finally {
      loading.value = false;
    }
  }

  return { loading, items, load };
}
