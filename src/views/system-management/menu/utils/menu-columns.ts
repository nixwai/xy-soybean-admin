import { h } from 'vue';
import type { Ref, VNode } from 'vue';
import { NButton, NPopconfirm, NSpace, NSwitch, NTag, NTooltip } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { useSvgIcon } from '@/hooks/common/icon';
import type { MenuTreeNode } from '../typings';

interface MenuColumnHandlers {
  /** 正在提交启停请求的菜单 ID。 */
  pendingStatusId: Ref<string>;
  onCreateChild: (row: MenuTreeNode) => void;
  onEdit: (row: MenuTreeNode) => void;
  onDelete: (row: MenuTreeNode) => void | Promise<void>;
  onToggleStatus: (row: MenuTreeNode) => void | Promise<void>;
}

/** 渲染菜单图标列，同时展示图标和图标名称。 */
function renderIcon(row: MenuTreeNode, renderSvgIcon: ReturnType<typeof useSvgIcon>['SvgIconVNode']): VNode {
  if (!row.icon) {
    return h('span', { class: 'text-#999' }, '-');
  }

  const iconNode = renderSvgIcon({ icon: row.icon, fontSize: 18 });

  return h('div', { class: 'flex-y-center gap-8px' }, [
    iconNode ? iconNode() : null,
    h('span', { class: 'text-12px text-#666' }, row.icon)
  ]);
}

/** 渲染权限编码列，未配置权限时展示占位符。 */
function renderPermissionCode(row: MenuTreeNode): VNode {
  if (!row.permissionCode) {
    return h('span', { class: 'text-#999' }, '登录即可见');
  }

  return h(NTag, { size: 'small', bordered: false, type: 'info' }, { default: () => row.permissionCode });
}

/** 构建菜单树形表格列和行操作。 */
export function createMenuColumns(handlers: MenuColumnHandlers): DataTableColumns<MenuTreeNode> {
  const { SvgIconVNode } = useSvgIcon();

  return [
    { title: '菜单标题', key: 'title', minWidth: 200, ellipsis: { tooltip: true } },
    { title: '图标', key: 'icon', minWidth: 180, render: row => renderIcon(row, SvgIconVNode) },
    { title: '路径', key: 'path', minWidth: 200, ellipsis: { tooltip: true } },
    { title: '排序', key: 'order', width: 80, align: 'center' },
    { title: '权限编码', key: 'permissionCode', minWidth: 160, render: row => renderPermissionCode(row) },
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
      width: 230,
      align: 'center',
      render: row => {
        const hasChildren = Boolean(row.children?.length);
        const deleteButton = h(
          NButton,
          {
            size: 'small',
            type: 'error',
            secondary: true,
            disabled: hasChildren,
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
                { size: 'small', secondary: true, onClick: () => handlers.onCreateChild(row) },
                { default: () => '新增子级' }
              ),
              h(
                NButton,
                { size: 'small', type: 'primary', secondary: true, onClick: () => handlers.onEdit(row) },
                { default: () => '编辑' }
              ),
              hasChildren
                ? h(NTooltip, null, {
                    trigger: () => h('span', { class: 'inline-flex' }, [deleteButton]),
                    default: () => '请先删除该菜单下的子菜单'
                  })
                : h(
                    NPopconfirm,
                    { onPositiveClick: () => handlers.onDelete(row) },
                    {
                      trigger: () => deleteButton,
                      default: () => '删除后该菜单将从所有管理员的可见菜单中移除，确认继续吗？'
                    }
                  )
            ]
          }
        );
      }
    }
  ];
}
