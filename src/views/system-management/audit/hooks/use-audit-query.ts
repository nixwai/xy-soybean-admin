import { ref } from 'vue';
import { fetchAuditList } from '@/service/api';
import { AUDIT_PAGE_SIZE } from '../config/constants';

/** 审计日志游标分页查询，后端不返回总数，只能通过 hasMore 判断是否还有下一页。 */
export function useAuditQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.AuditLog[]>([]);
  const nextCursor = ref<string | undefined>();
  const hasMore = ref(false);

  /**
   * 拉取审计记录。
   *
   * @param reset 为真时丢弃游标并从第一页重新加载
   */
  async function load(reset = false) {
    loading.value = true;
    try {
      const cursor = reset ? undefined : nextCursor.value;
      const { data, error } = await fetchAuditList({ limit: AUDIT_PAGE_SIZE, ...(cursor ? { cursor } : {}) });
      if (error || !data) return;

      items.value = reset ? data.items : [...items.value, ...data.items];
      nextCursor.value = data.nextCursor ?? undefined;
      hasMore.value = data.hasMore;
    } finally {
      loading.value = false;
    }
  }

  return { loading, items, nextCursor, hasMore, load };
}
