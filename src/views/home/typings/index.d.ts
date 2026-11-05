/** 首页统计指标的取值，null 表示当前管理员无权访问对应数据源。 */
export type HomeStatValue = number | string | null;

/** 管理首页统计卡片的数据模型。 */
export interface HomeDashboardStats {
  admins: HomeStatValue;
  roles: HomeStatValue;
  permissions: HomeStatValue;
  menus: HomeStatValue;
  audits: HomeStatValue;
}

/** 管理首页统计卡片的展示模型。 */
export interface HomeStatCard {
  label: string;
  value: number | string;
  icon: string;
}
