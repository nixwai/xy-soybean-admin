import { ref } from 'vue';
import { fetchAssetUploadLimits } from '@/service/api/asset';
import { isAssetUploadLimits } from '../utils/upload-limits';

/** 上传配置失败即关闭上传入口；刷新期间不继续使用可能已经失效的旧限制。 */
export function useAssetUploadLimits() {
  const limits = ref<ApiManagement.AssetUploadLimits | null>(null);
  const loading = ref(false);
  const error = ref('');
  let sequence = 0;

  async function reload() {
    const current = ++sequence;
    limits.value = null;
    error.value = '';
    loading.value = true;
    try {
      const result = await fetchAssetUploadLimits();
      if (current !== sequence) return;
      if (result.error || !isAssetUploadLimits(result.data)) {
        error.value = '上传配置加载失败，已禁止上传，请重新加载配置';
        return;
      }
      limits.value = { ...result.data };
    } catch {
      if (current === sequence) error.value = '上传配置加载失败，已禁止上传，请重新加载配置';
    } finally {
      if (current === sequence) loading.value = false;
    }
  }
  return { limits, loading, error, reload };
}
