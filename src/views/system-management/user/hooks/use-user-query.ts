import { reactive, ref, toRef } from 'vue';
import { fetchUserList } from '@/service/api';
import { createDefaultUserQuery, USER_PAGE_SIZE } from '../config/constants';
import type { UserQueryModel } from '../typings';

/** 将页面筛选模型转换为后端查询参数，空关键词和全部状态不发送。 */
function buildUserListParams(page: number, pageSize: number, query: UserQueryModel) {
  const normalizedKeyword = query.keyword.trim();

  return {
    page,
    pageSize,
    ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
    ...(query.statusFilter === 'all' ? {} : { isActive: query.statusFilter === 'active' })
  } satisfies ApiManagement.UserListQuery;
}

/** 用户列表分页查询，只负责筛选条件、分页和列表数据。 */
export function useUserQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.User[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(USER_PAGE_SIZE);
  const query = reactive(createDefaultUserQuery());
  const keyword = toRef(query, 'keyword');
  const statusFilter = toRef(query, 'statusFilter');

  /** 按当前筛选和分页条件拉取用户列表。 */
  async function load() {
    loading.value = true;
    try {
      const params = buildUserListParams(page.value, pageSize.value, query);
      const { data, error } = await fetchUserList(params);
      if (error || !data) return;

      items.value = data.items;
      total.value = data.total;
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
    Object.assign(query, createDefaultUserQuery());
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

  return {
    loading,
    items,
    total,
    page,
    pageSize,
    query,
    keyword,
    statusFilter,
    load,
    search,
    reset,
    changePage,
    changePageSize
  };
}
