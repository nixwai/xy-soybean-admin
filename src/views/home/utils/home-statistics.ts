import type { HomeDashboardStats, HomeStatCard, HomeStatValue } from '../typings';

/** 卡片配置，顺序即首页展示顺序。 */
const STAT_CARD_CONFIG: { key: keyof HomeDashboardStats; i18nKey: string; icon: string }[] = [
  { key: 'admins', i18nKey: 'page.home.adminCount', icon: 'carbon:user-admin' },
  { key: 'roles', i18nKey: 'page.home.roleCount', icon: 'carbon:identification' },
  { key: 'permissions', i18nKey: 'page.home.permissionCount', icon: 'carbon:security' },
  { key: 'menus', i18nKey: 'page.home.menuCount', icon: 'carbon:menu' },
  { key: 'audits', i18nKey: 'page.home.auditCount', icon: 'carbon:activity' }
];

/**
 * 将统计数据转换为首页卡片。
 *
 * 取值为 null 的指标表示当前管理员无权访问对应接口，直接跳过而不展示为 0。
 */
export function createHomeStatCards(stats: HomeDashboardStats, translate: (key: string) => string): HomeStatCard[] {
  return STAT_CARD_CONFIG.flatMap(({ key, i18nKey, icon }) => {
    const value: HomeStatValue = stats[key];
    if (value === null) return [];
    return [{ label: translate(i18nKey), value, icon }];
  });
}

/** 审计接口只提供游标分页，首屏未取完时以 "+" 表示还有更多记录。 */
export function formatAuditCount(data: ApiManagement.AuditListResponse | null): HomeStatValue {
  if (!data) return null;
  return data.hasMore ? `${data.items.length}+` : data.items.length;
}
