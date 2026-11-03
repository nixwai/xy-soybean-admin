import { ref } from 'vue';
import { fetchPermissionList, fetchRoleList } from '@/service/api';
import { ROLE_PAGE_SIZE } from '../config/constants';

/** 角色列表、权限选项和分页查询。 */
export function useRoleQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Role[]>([]);
  const permissions = ref<ApiManagement.Permission[]>([]);
  const total = ref(0);
  const page = ref(1);

  async function load() {
    loading.value = true;
    try {
      const [roleResult, permissionResult] = await Promise.all([
        fetchRoleList({ page: page.value, pageSize: ROLE_PAGE_SIZE }),
        fetchPermissionList()
      ]);
      if (!roleResult.error && roleResult.data) {
        items.value = roleResult.data.items;
        total.value = roleResult.data.total;
      }
      if (!permissionResult.error && permissionResult.data) permissions.value = permissionResult.data.items;
    } finally {
      loading.value = false;
    }
  }

  async function changePage(value: number) {
    page.value = value;
    await load();
  }

  return { loading, items, permissions, total, page, load, changePage };
}
