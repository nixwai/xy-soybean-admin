import { h } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface AdminColumnHandlers {
  roles: Ref<ApiManagement.Role[]>;
  onEdit: (row: ApiManagement.Admin) => void;
  onPassword: (row: ApiManagement.Admin) => void;
  onDelete: (row: ApiManagement.Admin) => void | Promise<void>;
}

/** 构建管理员列表列，将行级动作从页面入口注入。 */
export function createAdminColumns(handlers: AdminColumnHandlers): DataTableColumns<ApiManagement.Admin> {
  return [
    { title: '用户名', key: 'username' },
    {
      title: '管理员类型',
      key: 'isSuperAdmin',
      render: row =>
        h(
          NTag,
          { type: row.isSuperAdmin ? 'warning' : 'info' },
          { default: () => (row.isSuperAdmin ? '超级管理员' : '普通管理员') }
        )
    },
    {
      title: '状态',
      key: 'isActive',
      render: row =>
        h(NTag, { type: row.isActive ? 'success' : 'error' }, { default: () => (row.isActive ? '启用' : '停用') })
    },
    {
      title: '角色',
      key: 'roleIds',
      render: row =>
        row.roleIds.map(id => handlers.roles.value.find(role => role.id === id)?.name || id).join('、') || '未绑定'
    },
    { title: '创建时间', key: 'createdAt' },
    {
      title: '操作',
      key: 'actions',
      render: row =>
        h(
          NSpace,
          { justify: 'center' },
          {
            default: () => [
              h(
                NButton,
                { size: 'small', type: 'primary', secondary: true, onClick: () => handlers.onEdit(row) },
                { default: () => '编辑' }
              ),
              h(
                NButton,
                { size: 'small', secondary: true, onClick: () => handlers.onPassword(row) },
                { default: () => '重置密码' }
              ),
              h(
                NPopconfirm,
                { onPositiveClick: () => handlers.onDelete(row) },
                {
                  trigger: () =>
                    h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => '删除' }),
                  default: () => '删除后不可恢复，确认继续吗？'
                }
              )
            ]
          }
        )
    }
  ];
}
