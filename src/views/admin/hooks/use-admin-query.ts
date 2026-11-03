import { ref } from 'vue';
import { fetchAdminList, fetchRoleList } from '@/service/api';
import { ADMIN_PAGE_SIZE } from '../config/constants';

/** 管理员列表和角色选项查询。 */
export function useAdminQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Admin[]>([]);
  const roles = ref<ApiManagement.Role[]>([]);
  const total = ref(0);
  const page = ref(1);

  async function load() {
    loading.value = true;
    try {
      const [adminResult, roleResult] = await Promise.all([
        fetchAdminList({ page: page.value, pageSize: ADMIN_PAGE_SIZE }),
        fetchRoleList({ page: 1, pageSize: 100 })
      ]);
      if (!adminResult.error && adminResult.data) {
        items.value = adminResult.data.items;
        total.value = adminResult.data.total;
      }
      if (!roleResult.error && roleResult.data) roles.value = roleResult.data.items;
    } finally {
      loading.value = false;
    }
  }

  async function changePage(value: number) {
    page.value = value;
    await load();
  }

  return { loading, items, roles, total, page, load, changePage };
}
