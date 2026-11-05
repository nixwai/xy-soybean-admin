import { computed, ref } from 'vue';
import { fetchRoleList } from '@/service/api';
import { OPTION_PAGE_SIZE } from '../config/constants';

/** 角色选项数据源，供管理员角色绑定和角色名称展示复用。 */
export function useRoleOptions() {
  const roleLoading = ref(false);
  const roles = ref<ApiManagement.Role[]>([]);

  /** 拉取未软删除的角色列表，受后端单页上限约束。 */
  async function loadRoles() {
    roleLoading.value = true;
    try {
      const { data, error } = await fetchRoleList({ page: 1, pageSize: OPTION_PAGE_SIZE });
      if (!error && data) {
        roles.value = data.items;
      }
    } finally {
      roleLoading.value = false;
    }
  }

  /** 角色 ID 到展示名称的映射。 */
  const roleNameMap = computed(() => new Map(roles.value.map(role => [role.id, role.name])));

  return { roleLoading, roles, roleNameMap, loadRoles };
}
