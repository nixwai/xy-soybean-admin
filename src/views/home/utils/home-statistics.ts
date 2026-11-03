import type { HomeDashboardStats, HomeStatCard } from '../typings';
/** 将统计数据转换为首页卡片，集中维护卡片顺序与图标配置。 */
export function createHomeStatCards(stats: HomeDashboardStats, translate: (key: string) => string): HomeStatCard[] {
  return [
    { label: translate('page.home.adminCount'), value: stats.admins, icon: 'carbon:user-admin' },
    { label: translate('page.home.roleCount'), value: stats.roles, icon: 'carbon:identification' },
    { label: translate('page.home.permissionCount'), value: stats.permissions, icon: 'carbon:security' },
    { label: translate('page.home.menuCount'), value: stats.menus, icon: 'carbon:menu' },
    { label: translate('page.home.auditCount'), value: stats.audits, icon: 'carbon:activity' }
  ];
}
