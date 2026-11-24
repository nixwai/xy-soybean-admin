import { ref } from 'vue';
import { fetchAuditOptions } from '@/service/api';
import type { AuditOption } from '../typings';

/** 审计筛选项数据源，动作与资源选项以后端注册表为准。 */
export function useAuditOptions() {
  const optionsLoading = ref(false);
  const actionOptions = ref<AuditOption[]>([]);
  const resourceOptions = ref<AuditOption[]>([]);
  const resultOptions = ref<AuditOption[]>([]);

  /** 拉取审计筛选项，请求失败时保留已加载的选项。 */
  async function loadOptions() {
    optionsLoading.value = true;
    try {
      const { data, error } = await fetchAuditOptions();
      if (!error && data) {
        actionOptions.value = data.actions;
        resourceOptions.value = data.resources;
        resultOptions.value = data.results;
      }
    } finally {
      optionsLoading.value = false;
    }
  }

  return { optionsLoading, actionOptions, resourceOptions, resultOptions, loadOptions };
}
