import { h } from 'vue';
import { NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

/** 构建审计日志表格列。 */
export function createAuditColumns(): DataTableColumns<ApiManagement.AuditLog> {
  return [
    { title: '时间', key: 'createdAt' },
    { title: '动作', key: 'action' },
    { title: '资源', key: 'resourceType' },
    { title: '目标 ID', key: 'targetId' },
    {
      title: '结果',
      key: 'succeeded',
      render: row =>
        h(NTag, { type: row.succeeded ? 'success' : 'error' }, { default: () => (row.succeeded ? '成功' : '失败') })
    },
    { title: '详情', key: 'details', render: row => (row.details ? JSON.stringify(row.details) : '-') }
  ];
}
