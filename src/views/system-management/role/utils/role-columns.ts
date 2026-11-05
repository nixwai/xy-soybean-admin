import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NPopconfirm, NSpace, NSwitch, NTag, NTooltip } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface RoleColumnHandlers {
  /** 正在提交启停请求的角色 ID。 */
  pendingStatusId: Ref<string>;
  onEdit: (row: ApiManagement.Role) => void;
  onPermissionAssign: (row: ApiManagement.Role) => void;
  onDelete: (row: ApiManagement.Role) => void | Promise<void>;
  onToggleStatus: (row: ApiManagement.Role) => void | Promise<void>;
}

/** 渲染状态列，受保护角色禁止行内启停。 */
function renderStatus(row: ApiManagement.Role, handlers: RoleColumnHandlers): VNode {
  const statusSwitch = h(NSwitch, {
    value: row.isActive,
    size: 'small',
    disabled: row.isProtected,
    loading: handlers.pendingStatusId.value === row.id,
    'onUpdate:value': () => handlers.onToggleStatus(row)
  });

  if (!row.isProtected) {
    return statusSwitch;
  }

  return h(NTooltip, null, {
    trigger: () => h('span', { class: 'inline-flex' }, [statusSwitch]),
    default: () => '受保护角色不允许停用'
  });
}

/** 渲染角色标识列，标记系统维护和受保护角色。 */
function renderTags(row: ApiManagement.Role): VNode[] {
  const tags: VNode[] = [];

  if (row.isSystem) {
    tags.push(h(NTag, { size: 'tiny', type: 'info', bordered: false }, { default: () => '系统' }));
  }

  if (row.isProtected) {
    tags.push(h(NTag, { size: 'tiny', type: 'warning', bordered: false }, { default: () => '受保护' }));
  }

  if (!tags.length) {
    tags.push(h(NTag, { size: 'tiny', bordered: false }, { default: () => '自定义' }));
  }

  return tags;
}

/** 构建角色表格列和行操作。 */
export function createRoleColumns(handlers: RoleColumnHandlers): DataTableColumns<ApiManagement.Role> {
  return [
    { title: '编码', key: 'code', minWidth: 140, ellipsis: { tooltip: true } },
    { title: '名称', key: 'name', minWidth: 140, ellipsis: { tooltip: true } },
    {
      title: '标识',
      key: 'flags',
      minWidth: 120,
      render: row => h('div', { class: 'flex-y-center flex-wrap gap-4px' }, renderTags(row))
    },
    {
      title: '描述',
      key: 'description',
      minWidth: 200,
      ellipsis: { tooltip: true },
      render: row => row.description || '-'
    },
    {
      title: '状态',
      key: 'isActive',
      minWidth: 90,
      render: row => renderStatus(row, handlers)
    },
    {
      title: '权限数',
      key: 'permissionIds',
      minWidth: 100,
      align: 'center',
      render: row =>
        h(
          NButton,
          { size: 'small', text: true, type: 'primary', onClick: () => handlers.onPermissionAssign(row) },
          { default: () => `${row.permissionIds.length} 项` }
        )
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      align: 'center',
      render: row => {
        const deleteButton = h(
          NButton,
          {
            size: 'small',
            type: 'error',
            secondary: true,
            disabled: row.isProtected,
            onClick: () => handlers.onDelete(row)
          },
          { default: () => '删除' }
        );

        return h(
          NSpace,
          { justify: 'center', size: 8 },
          {
            default: () => [
              h(
                NButton,
                { size: 'small', type: 'primary', secondary: true, onClick: () => handlers.onEdit(row) },
                { default: () => '编辑' }
              ),
              h(
                NButton,
                { size: 'small', secondary: true, onClick: () => handlers.onPermissionAssign(row) },
                { default: () => '权限' }
              ),
              row.isProtected
                ? h(NTooltip, null, {
                    trigger: () => h('span', { class: 'inline-flex' }, [deleteButton]),
                    default: () => '受保护角色不允许删除'
                  })
                : h(
                    NPopconfirm,
                    { onPositiveClick: () => handlers.onDelete(row) },
                    {
                      trigger: () => deleteButton,
                      default: () => '删除后将同时解除该角色的权限和管理员绑定，确认继续吗？'
                    }
                  )
            ]
          }
        );
      }
    }
  ];
}
