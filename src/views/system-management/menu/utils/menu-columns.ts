import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NSpace, NSwitch, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { MenuTreeNode } from '../typings';

interface MenuColumnHandlers {
  pendingStatusId: Ref<string>;
  onEdit: (row: MenuTreeNode) => void;
  onToggleStatus: (row: MenuTreeNode) => void | Promise<void>;
}

function renderPermission(row: MenuTreeNode): VNode {
  if (!row.permissionCode) return h('span', { class: 'text-#999' }, '登录即可见');
  return h(NTag, { size: 'small', bordered: false, type: 'info' }, { default: () => row.permissionCode });
}

/** 展示后端维护的菜单元数据，并仅开放支持的编辑动作。 */
export function createMenuColumns(handlers: MenuColumnHandlers): DataTableColumns<MenuTreeNode> {
  return [
    { title: '菜单标题', key: 'title', minWidth: 200, ellipsis: { tooltip: true } },
    { title: '菜单标识', key: 'menuKey', minWidth: 180, ellipsis: { tooltip: true } },
    { title: '路径', key: 'path', minWidth: 220, ellipsis: { tooltip: true } },
    { title: '排序', key: 'order', width: 80, align: 'center' },
    { title: '权限编码', key: 'permissionCode', minWidth: 160, render: renderPermission },
    {
      title: '可见范围',
      key: 'isRootOnly',
      minWidth: 110,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', bordered: false, type: row.isRootOnly ? 'warning' : 'default' },
          { default: () => (row.isRootOnly ? '仅根管理员' : '全部管理员') }
        )
    },
    {
      title: '权限状态',
      key: 'permissionAvailable',
      minWidth: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', bordered: false, type: row.permissionAvailable ? 'success' : 'error' },
          { default: () => (row.permissionAvailable ? '可用' : '不可用') }
        )
    },
    {
      title: '状态',
      key: 'isActive',
      width: 90,
      align: 'center',
      render: row =>
        h(NSwitch, {
          value: row.isActive,
          size: 'small',
          loading: handlers.pendingStatusId.value === row.id,
          'onUpdate:value': () => handlers.onToggleStatus(row)
        })
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      align: 'center',
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
              )
            ]
          }
        )
    }
  ];
}
