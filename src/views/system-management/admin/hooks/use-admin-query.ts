import { reactive, ref } from 'vue';
import { fetchAdminList } from '@/service/api';
import { ADMIN_PAGE_SIZE, createDefaultAdminQuery } from '../config/constants';
import type { AdminQueryModel } from '../typings';

/** 将管理员筛选条件转换为后端分页查询参数。 */
export function buildAdminListParams(page: number, pageSize: number, query: AdminQueryModel) {
  return {
    page,
    pageSize,
    id: query.id,
    username: query.username,
    isActive: !query.statusFilter ? undefined : query.statusFilter === 'active',
    isRoot: !query.typeFilter ? undefined : query.typeFilter === 'root'
  } satisfies ApiManagement.AdminListQuery;
}

/** 管理员列表分页查询，负责筛选条件、分页和列表数据。 */
export function useAdminQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Admin[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(ADMIN_PAGE_SIZE);
  const query = reactive(createDefaultAdminQuery());

  /** 按当前筛选和分页条件拉取管理员列表。 */
  async function load() {
    loading.value = true;
    try {
      const params = buildAdminListParams(page.value, pageSize.value, query);
      const { data, error } = await fetchAdminList(params);
      if (!error && data) {
        items.value = data.items;
        total.value = data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  /** 提交新的筛选条件并回到第一页。 */
  async function search() {
    page.value = 1;
    await load();
  }

  /** 清空筛选条件并回到第一页。 */
  async function reset() {
    Object.assign(query, createDefaultAdminQuery());
    page.value = 1;
    await load();
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

  return { loading, items, total, page, pageSize, query, load, search, reset, changePage, changePageSize };
}
