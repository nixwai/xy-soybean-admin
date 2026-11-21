import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NSpace, NTag, NTooltip } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { formatDateTime } from '../../utils/datetime';

interface UserColumnHandlers {
  /** 当前管理员是否拥有用户更新权限。 */
  canUpdate: boolean;
  /** 正在提交启停请求的用户 ID。 */
  pendingStatusId: Ref<string>;
  onToggleStatus: (row: ApiManagement.User) => void | Promise<void>;
}

/** 渲染用户启用状态，更新权限不足时只展示结果而不提供操作入口。 */
function renderStatus(row: ApiManagement.User): VNode {
  return h(
    NTag,
    { size: 'small', bordered: false, type: row.isActive ? 'success' : 'default' },
    { default: () => (row.isActive ? '已启用' : '已停用') }
  );
}

/** 渲染微信 openId，避免长标识撑开表格。 */
function renderOpenId(row: ApiManagement.User): VNode {
  const openId = row.openId || '-';

  return h(
    NTooltip,
    { placement: 'top-start' },
    {
      trigger: () => h('span', { class: 'block max-w-220px truncate' }, openId),
      default: () => openId
    }
  );
}

/** 构建用户列表列，将启停动作和权限状态从页面入口注入。 */
export function createUserColumns(handlers: UserColumnHandlers): DataTableColumns<ApiManagement.User> {
  const columns: DataTableColumns<ApiManagement.User> = [
    { title: '用户 ID', key: 'id', width: 120, ellipsis: { tooltip: true } },
    { title: '微信标识', key: 'openId', minWidth: 180, render: renderOpenId },
    {
      title: '昵称',
      key: 'nickname',
      minWidth: 140,
      ellipsis: { tooltip: true },
      render: row => row.nickname || '-'
    },
    {
      title: '状态',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: row => renderStatus(row)
    },
    {
      title: '最近登录',
      key: 'lastLoginAt',
      width: 170,
      render: row => formatDateTime(row.lastLoginAt)
    },
    {
      title: '创建时间',
      key: 'createdAt',
      width: 170,
      render: row => formatDateTime(row.createdAt)
    }
  ];

  if (!handlers.canUpdate) {
    return columns;
  }

  return [
    ...columns,
    {
      title: '操作',
      key: 'actions',
      width: 100,
      align: 'center',
      render: row =>
        h(
          NSpace,
          { justify: 'center', size: 8 },
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  type: row.isActive ? 'warning' : 'success',
                  secondary: true,
                  loading: handlers.pendingStatusId.value === row.id,
                  onClick: () => handlers.onToggleStatus(row)
                },
                { default: () => (row.isActive ? '停用' : '启用') }
              )
            ]
          }
        )
    }
  ];
}
