import { reactive, ref } from 'vue';
import { fetchRoleList } from '@/service/api';
import { createDefaultRoleQuery, ROLE_PAGE_SIZE } from '../config/constants';
import type { RoleQueryModel } from '../typings';

/** 将角色筛选条件转换为后端分页查询参数。 */
export function buildRoleListParams(page: number, pageSize: number, query: RoleQueryModel) {
  return {
    page,
    pageSize,
    code: query.code,
    name: query.name,
    isActive: query.statusFilter === null ? undefined : query.statusFilter === 'active',
    isSystem: query.typeFilter === null ? undefined : query.typeFilter === 'system'
  } satisfies ApiManagement.RoleListQuery;
}

/** 角色列表分页查询，负责筛选条件、分页和列表数据。 */
export function useRoleQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.Role[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(ROLE_PAGE_SIZE);
  const query = reactive(createDefaultRoleQuery());

  /** 按当前筛选和分页条件拉取角色列表。 */
  async function load() {
    loading.value = true;
    try {
      const params = buildRoleListParams(page.value, pageSize.value, query);
      const { data, error } = await fetchRoleList(params);
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
    Object.assign(query, createDefaultRoleQuery());
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
