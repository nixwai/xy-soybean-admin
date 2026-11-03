import { h } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface RoleColumnHandlers {
  onEdit: (row: ApiManagement.Role) => void;
  onDelete: (row: ApiManagement.Role) => void | Promise<void>;
}

/** 构建角色表格列和行操作。 */
export function createRoleColumns(handlers: RoleColumnHandlers): DataTableColumns<ApiManagement.Role> {
  return [
    { title: '编码', key: 'code' },
    { title: '名称', key: 'name' },
    { title: '描述', key: 'description' },
    {
      title: '状态',
      key: 'isActive',
      render: row =>
        h(NTag, { type: row.isActive ? 'success' : 'error' }, { default: () => (row.isActive ? '启用' : '停用') })
    },
    { title: '权限数', key: 'permissionIds', render: row => row.permissionIds.length },
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
                NPopconfirm,
                { onPositiveClick: () => handlers.onDelete(row) },
                {
                  trigger: () =>
                    h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => '删除' }),
                  default: () => '确认删除该角色吗？'
                }
              )
            ]
          }
        )
    }
  ];
}
