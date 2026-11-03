/** 管理首页统计卡片的数据模型。 */
export interface HomeDashboardStats {
  admins: number;
  roles: number;
  permissions: number;
  menus: number;
  audits: number;
}

/** 管理首页统计卡片的展示模型。 */
export interface HomeStatCard {
  label: string;
  value: number;
  icon: string;
}
