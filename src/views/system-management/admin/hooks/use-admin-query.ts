import { ref } from 'vue';
import { fetchAdminList } from '@/service/api';
import { ADMIN_PAGE_SIZE } from '../config/constants';

/** 管理员列表分页查询，只负责查询条件、分页和列表数据。 */
export function useAdminQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Admin[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(ADMIN_PAGE_SIZE);

  /** 按当前分页条件拉取管理员列表。 */
  async function load() {
    loading.value = true;
    try {
      const { data, error } = await fetchAdminList({ page: page.value, pageSize: pageSize.value });
      if (!error && data) {
        items.value = data.items;
        total.value = data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  /** 切换页码后重新查询。 */
  async function changePage(value: number) {
    page.value = value;
    await load();
  }

  /** 切换每页条数并回到首页后重新查询。 */
  async function changePageSize(value: number) {
    pageSize.value = value;
    page.value = 1;
    await load();
  }

  return { loading, items, total, page, pageSize, load, changePage, changePageSize };
}
