import { computed, onMounted, ref } from 'vue';
import { fetchAdminList, fetchAuditList, fetchMenuList, fetchPermissionList, fetchRoleList } from '@/service/api';
import { $t } from '@/locales';
import { createHomeStatCards } from '../utils/home-statistics';
import type { HomeDashboardStats } from '../typings';

/** 管理首页的统计数据与加载流程。 */
export function useHomeDashboard() {
  const loading = ref(true);
  const stats = ref<HomeDashboardStats>({ admins: 0, roles: 0, permissions: 0, menus: 0, audits: 0 });
  const cards = computed(() => createHomeStatCards(stats.value, $t as unknown as (key: string) => string));

  async function loadDashboardStats() {
    loading.value = true;
    const [admins, roles, permissions, menus, audits] = await Promise.all([
      fetchAdminList({ page: 1, pageSize: 1 }),
      fetchRoleList({ page: 1, pageSize: 1 }),
      fetchPermissionList(),
      fetchMenuList(),
      fetchAuditList({ limit: 1 })
    ]);
    stats.value = {
      admins: admins.data?.total || 0,
      roles: roles.data?.total || 0,
      permissions: permissions.data?.total || 0,
      menus: menus.data?.total || 0,
      audits: audits.data?.items.length || 0
    };
    loading.value = false;
  }

  onMounted(loadDashboardStats);

  return { loading, stats, cards, loadDashboardStats };
}
