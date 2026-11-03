import { h } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface MenuColumnHandlers {
  onEdit: (row: ApiManagement.Menu) => void;
  onToggle: (row: ApiManagement.Menu) => void | Promise<void>;
  onDelete: (row: ApiManagement.Menu) => void | Promise<void>;
}

/** 构建菜单表格列和行操作。 */
export function createMenuColumns(handlers: MenuColumnHandlers): DataTableColumns<ApiManagement.Menu> {
  return [
    { title: '标题', key: 'title' },
    { title: '路径', key: 'path' },
    { title: '权限编码', key: 'permissionCode' },
    { title: '排序', key: 'order' },
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
                { size: 'small', secondary: true, onClick: () => handlers.onToggle(row) },
                { default: () => (row.isActive ? '停用' : '启用') }
              ),
              h(
                NPopconfirm,
                { onPositiveClick: () => handlers.onDelete(row) },
                {
                  trigger: () =>
                    h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => '删除' }),
                  default: () => '确认删除该菜单吗？'
                }
              )
            ]
          }
        )
    }
  ];
}
