import { computed, onMounted, ref } from 'vue';
import { PERMISSION_CODE } from '@/constants/permission';
import { fetchAdminList, fetchAuditList, fetchMenuList, fetchPermissionList, fetchRoleList } from '@/service/api';
import { $t } from '@/locales';
import { useAuth } from '@/hooks/business/auth';
import { createHomeStatCards, formatAuditCount } from '../utils/home-statistics';
import type { HomeDashboardStats } from '../typings';

/** 审计首屏取样条数，取后端游标分页 limit 上限。 */
const AUDIT_SAMPLE_LIMIT = 100;

/** 管理首页的统计数据与加载流程，按当前管理员权限决定可访问的数据源。 */
export function useHomeDashboard() {
  const loading = ref(true);
  const stats = ref<HomeDashboardStats>({ admins: null, roles: null, permissions: null, menus: null, audits: null });
  const { isRootAdmin, hasAuth } = useAuth();

  const cards = computed(() => createHomeStatCards(stats.value, $t as unknown as (key: string) => string));
  /** 当前管理员是否没有任何可展示的统计指标。 */
  const isEmpty = computed(() => !cards.value.length);

  async function loadDashboardStats() {
    loading.value = true;
    try {
      const next: HomeDashboardStats = { admins: null, roles: null, permissions: null, menus: null, audits: null };

      // 管理员、角色、权限和菜单接口在后端均为仅根管理员可访问
      if (isRootAdmin.value) {
        const [admins, roles, permissions, menus] = await Promise.all([
          fetchAdminList({ page: 1, pageSize: 1 }),
          fetchRoleList({ page: 1, pageSize: 1 }),
          fetchPermissionList(),
          fetchMenuList()
        ]);
        next.admins = admins.data?.total ?? null;
        next.roles = roles.data?.total ?? null;
        next.permissions = permissions.data?.total ?? null;
        next.menus = menus.data?.total ?? null;
      }

      // 审计接口需要 system.audit.read 权限，根管理员默认拥有
      if (hasAuth(PERMISSION_CODE.AUDIT_READ)) {
        const audits = await fetchAuditList({ limit: AUDIT_SAMPLE_LIMIT });
        next.audits = formatAuditCount(audits.data);
      }

      stats.value = next;
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadDashboardStats);

  return { loading, stats, cards, isEmpty, loadDashboardStats };
}
