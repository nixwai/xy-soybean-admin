import { ref } from 'vue';
import { fetchAuditList } from '@/service/api';

/** 审计日志游标分页查询。 */
export function useAuditQuery() {
  const loading = ref(false);
  const items = ref<ApiManagement.AuditLog[]>([]);
  const nextCursor = ref<string | undefined>();
  const hasMore = ref(false);

  async function load(reset = false) {
    loading.value = true;
    try {
      const result = await fetchAuditList({
        limit: 20,
        ...(reset ? {} : nextCursor.value ? { cursor: nextCursor.value } : {})
      });
      if (!result.error && result.data) {
        items.value = reset ? result.data.items : [...items.value, ...result.data.items];
        nextCursor.value = result.data.nextCursor || undefined;
        hasMore.value = result.data.hasMore;
      }
    } finally {
      loading.value = false;
    }
  }

  return { loading, items, nextCursor, hasMore, load };
}
