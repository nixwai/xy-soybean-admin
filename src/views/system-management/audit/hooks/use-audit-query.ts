import { reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { fetchAuditList } from '@/service/api';
import { AUDIT_PAGE_SIZE, createDefaultAuditQuery } from '../config/constants';
import type { AuditQueryModel } from '../typings';

/** 将审计日志筛选条件转换为后端游标查询参数。 */
export function buildAuditListParams(query: AuditQueryModel): Omit<ApiManagement.AuditQuery, 'limit' | 'cursor'> {
  const [createdFrom, createdTo] = query.createdRange ?? [];

  return {
    actorAdminId: query.actorAdminId,
    targetId: query.targetId,
    action: query.actionFilter,
    resourceType: query.resourceTypeFilter,
    succeeded: !query.resultFilter ? undefined : query.resultFilter === 'succeeded',
    createdFrom: !createdFrom ? undefined : dayjs(createdFrom).startOf('day').toISOString(),
    createdTo: !createdTo ? undefined : dayjs(createdTo).endOf('day').toISOString()
  };
}

/** 审计日志游标分页查询，负责筛选条件、游标和列表数据。 */
export function useAuditQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.AuditLog[]>([]);
  const nextCursor = ref<string | null>(null);
  const hasMore = ref(false);
  const query = reactive(createDefaultAuditQuery());

  /** 拉取审计记录，reset 为真时丢弃游标并从第一页重新加载。 */
  async function load(shouldReset = false) {
    loading.value = true;
    try {
      const cursor = shouldReset ? undefined : (nextCursor.value ?? undefined);
      const params = { limit: AUDIT_PAGE_SIZE, ...buildAuditListParams(query), cursor };
      const { data, error } = await fetchAuditList(params);
      if (error || !data) return;

      items.value = shouldReset ? data.items : [...items.value, ...data.items];
      nextCursor.value = data.nextCursor;
      hasMore.value = data.hasMore;
    } finally {
      loading.value = false;
    }
  }

  /** 提交新的审计筛选条件并从第一页查询。 */
  async function search() {
    await load(true);
  }

  /** 清空审计筛选条件并从第一页查询。 */
  async function reset() {
    Object.assign(query, createDefaultAuditQuery());
    await load(true);
  }

  return { loading, items, nextCursor, hasMore, query, load, search, reset };
}
