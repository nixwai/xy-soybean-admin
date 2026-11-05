import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface PermissionColumnHandlers {
  /** 正在提交启停请求的权限 ID。 */
  pendingId: Ref<string>;
  onToggle: (row: ApiManagement.Permission) => void | Promise<void>;
}

/** 渲染布尔语义标签。 */
function renderFlagTag(value: boolean, positiveText: string, negativeText: string): VNode {
  return h(
    NTag,
    { size: 'small', bordered: false, type: value ? 'success' : 'default' },
    { default: () => (value ? positiveText : negativeText) }
  );
}

/** 构建单个权限分类下的表格列和启停操作。 */
export function createPermissionColumns(
  handlers: PermissionColumnHandlers
): DataTableColumns<ApiManagement.Permission> {
  return [
    { title: '权限编码', key: 'code', minWidth: 200, ellipsis: { tooltip: true } },
    { title: '名称', key: 'name', minWidth: 130, ellipsis: { tooltip: true } },
    {
      title: '描述',
      key: 'description',
      minWidth: 220,
      ellipsis: { tooltip: true },
      render: row => row.description || '-'
    },
    {
      title: '可分配',
      key: 'isAssignable',
      minWidth: 90,
      align: 'center',
      render: row => renderFlagTag(row.isAssignable, '可分配', '不可分配')
    },
    {
      title: '受保护',
      key: 'isProtected',
      minWidth: 90,
      align: 'center',
      render: row => renderFlagTag(row.isProtected, '受保护', '普通')
    },
    {
      title: '状态',
      key: 'isActive',
      minWidth: 80,
      align: 'center',
      render: row => renderFlagTag(row.isActive, '启用', '停用')
    },
    {
      title: '操作',
      key: 'actions',
      width: 110,
      align: 'center',
      render: row =>
        h(
          NPopconfirm,
          { onPositiveClick: () => handlers.onToggle(row) },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  secondary: true,
                  type: row.isActive ? 'warning' : 'success',
                  loading: handlers.pendingId.value === row.id
                },
                { default: () => (row.isActive ? '停用' : '启用') }
              ),
            default: () =>
              row.isActive
                ? '停用后该权限将从可分配目录移除且不再对任何管理员生效，确认继续吗？'
                : '启用后该权限可重新绑定给普通角色，确认继续吗？'
          }
        )
    }
  ];
}
