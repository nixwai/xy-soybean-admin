import { h } from 'vue';
import { NTag, NTooltip } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { formatDateTime } from '../../utils/datetime';
import { formatAuditDetails, getAuditActionLabel, getAuditResourceLabel } from './audit-labels';

/** 构建审计日志表格列。 */
export function createAuditColumns(): DataTableColumns<ApiManagement.AuditLog> {
  return [
    {
      title: '时间',
      key: 'createdAt',
      width: 180,
      render: row => formatDateTime(row.createdAt)
    },
    {
      title: '操作者',
      key: 'actorAdminId',
      width: 110,
      render: row => row.actorAdminId ?? h('span', { class: 'text-#999' }, '系统')
    },
    {
      title: '操作',
      key: 'action',
      minWidth: 160,
      render: row =>
        h('div', { class: 'flex-col' }, [
          h('span', getAuditActionLabel(row.action)),
          h('span', { class: 'text-12px text-#999' }, row.action)
        ])
    },
    {
      title: '资源',
      key: 'resourceType',
      width: 100,
      render: row => getAuditResourceLabel(row.resourceType)
    },
    {
      title: '目标 ID',
      key: 'targetId',
      width: 100,
      render: row => row.targetId ?? '-'
    },
    {
      title: '结果',
      key: 'succeeded',
      width: 90,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', bordered: false, type: row.succeeded ? 'success' : 'error' },
          { default: () => (row.succeeded ? '成功' : '失败') }
        )
    },
    {
      title: '变更摘要',
      key: 'details',
      minWidth: 220,
      render: row => {
        const text = formatAuditDetails(row.details);
        if (text === '-') return h('span', { class: 'text-#999' }, text);

        return h(
          NTooltip,
          { placement: 'top-start', style: 'max-width: 420px' },
          {
            trigger: () => h('span', { class: 'block truncate' }, text),
            default: () => text
          }
        );
      }
    }
  ];
}
