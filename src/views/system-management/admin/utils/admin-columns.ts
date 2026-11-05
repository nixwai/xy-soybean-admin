import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NSpace, NSwitch, NTag, NTooltip } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { formatDateTime } from '../../utils/datetime';

interface AdminColumnHandlers {
  /** 角色 ID 到展示名称的映射。 */
  roleNameMap: Ref<Map<string, string>>;
  /** 当前登录管理员 ID，用于禁用对自身的高危操作。 */
  currentAdminId: string;
  /** 正在提交启停请求的管理员 ID。 */
  pendingStatusId: Ref<string>;
  onEdit: (row: ApiManagement.Admin) => void;
  onRoleAssign: (row: ApiManagement.Admin) => void;
  onPassword: (row: ApiManagement.Admin) => void;
  onDelete: (row: ApiManagement.Admin) => void;
  onToggleStatus: (row: ApiManagement.Admin) => void | Promise<void>;
}

/** 渲染状态列，根管理员和当前登录账号不允许行内切换启停。 */
function renderStatus(row: ApiManagement.Admin, handlers: AdminColumnHandlers): VNode {
  const lockedByRoot = row.isRoot;
  const lockedBySelf = row.id === handlers.currentAdminId;
  const locked = lockedByRoot || lockedBySelf;

  const statusSwitch = h(NSwitch, {
    value: row.isActive,
    size: 'small',
    disabled: locked,
    loading: handlers.pendingStatusId.value === row.id,
    'onUpdate:value': () => handlers.onToggleStatus(row)
  });

  if (!locked) {
    return statusSwitch;
  }

  const tip = lockedByRoot ? '根管理员状态变更需复核当前密码，请使用编辑' : '不能停用当前登录账号';

  return h(NTooltip, null, {
    trigger: () => h('span', { class: 'inline-flex' }, [statusSwitch]),
    default: () => tip
  });
}

/** 渲染已绑定角色列，未绑定角色时给出占位文案。 */
function renderRoles(row: ApiManagement.Admin, roleNameMap: Map<string, string>): VNode[] {
  if (!row.roleIds.length) {
    return [h('span', { class: 'text-#999' }, '未绑定')];
  }

  return row.roleIds.map(roleId =>
    h(
      NTag,
      { size: 'small', type: 'info', bordered: false, class: 'mr-4px' },
      { default: () => roleNameMap.get(roleId) ?? `角色 ${roleId}` }
    )
  );
}

/** 构建管理员列表列，将行级动作从页面入口注入。 */
export function createAdminColumns(handlers: AdminColumnHandlers): DataTableColumns<ApiManagement.Admin> {
  return [
    { title: '用户名', key: 'username', minWidth: 140, ellipsis: { tooltip: true } },
    {
      title: '管理员类型',
      key: 'isRoot',
      minWidth: 120,
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.isRoot ? 'warning' : 'default', bordered: false },
          { default: () => (row.isRoot ? '根管理员' : '普通管理员') }
        )
    },
    {
      title: '状态',
      key: 'isActive',
      minWidth: 90,
      render: row => renderStatus(row, handlers)
    },
    {
      title: '角色',
      key: 'roleIds',
      minWidth: 180,
      render: row =>
        h('div', { class: 'flex-y-center flex-wrap gap-4px' }, renderRoles(row, handlers.roleNameMap.value))
    },
    {
      title: '创建时间',
      key: 'createdAt',
      minWidth: 170,
      render: row => formatDateTime(row.createdAt)
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      align: 'center',
      render: row => {
        const isSelf = row.id === handlers.currentAdminId;

        const deleteButton = h(
          NButton,
          {
            size: 'small',
            type: 'error',
            secondary: true,
            disabled: isSelf,
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
                { size: 'small', secondary: true, onClick: () => handlers.onRoleAssign(row) },
                { default: () => '角色' }
              ),
              h(
                NButton,
                { size: 'small', secondary: true, onClick: () => handlers.onPassword(row) },
                { default: () => '重置密码' }
              ),
              isSelf
                ? h(NTooltip, null, {
                    trigger: () => h('span', { class: 'inline-flex' }, [deleteButton]),
                    default: () => '不能删除当前登录账号'
                  })
                : deleteButton
            ]
          }
        );
      }
    }
  ];
}
