/** 审计记录每页条数，受后端游标分页 limit 上限约束。 */
export const AUDIT_PAGE_SIZE = 20;

/** 审计动作编码到中文名称的映射，未登记的编码原样展示。 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'admin.create': '创建管理员',
  'admin.update': '更新管理员',
  'admin.reset-password': '重置管理员密码',
  'admin.soft-delete': '删除管理员',
  'admin.role-bind': '绑定管理员角色',
  'admin.role-unbind': '解绑管理员角色',
  'role.create': '创建角色',
  'role.update': '更新角色',
  'role.soft-delete': '删除角色',
  'role.permission-bind': '绑定角色权限',
  'role.permission-unbind': '解绑角色权限',
  'permission.enable': '启用权限',
  'permission.disable': '停用权限',
  'menu.create': '创建菜单',
  'menu.update': '更新菜单',
  'menu.soft-delete': '删除菜单'
};

/** 审计资源类型到中文名称的映射。 */
export const AUDIT_RESOURCE_LABELS: Record<string, string> = {
  admin: '管理员',
  role: '角色',
  permission: '权限',
  menu: '菜单'
};
