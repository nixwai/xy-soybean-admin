import { h } from 'vue';
import { NButton, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface PermissionColumnHandlers {
  onToggle: (row: ApiManagement.Permission) => void | Promise<void>;
}

/** 构建权限表格列和启停操作。 */
export function createPermissionColumns(
  handlers: PermissionColumnHandlers
): DataTableColumns<ApiManagement.Permission> {
  return [
    { title: '编码', key: 'code' },
    { title: '资源', key: 'resource' },
    { title: '方法', key: 'method' },
    { title: '名称', key: 'name' },
    { title: '描述', key: 'description' },
    {
      title: '状态',
      key: 'isActive',
      render: row =>
        h(NTag, { type: row.isActive ? 'success' : 'error' }, { default: () => (row.isActive ? '启用' : '停用') })
    },
    {
      title: '操作',
      key: 'actions',
      render: row =>
        h(
          NButton,
          {
            size: 'small',
            type: row.isActive ? 'warning' : 'success',
            secondary: true,
            onClick: () => handlers.onToggle(row)
          },
          { default: () => (row.isActive ? '停用' : '启用') }
        )
    }
  ];
}
