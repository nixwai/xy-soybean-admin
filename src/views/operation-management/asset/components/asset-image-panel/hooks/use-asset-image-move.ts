import { ref } from 'vue';
import { fetchAssetImageMove } from '@/service/api';

/** 提交图片位置变更，成功后通知调用方刷新素材列表。 */
export function useAssetImageMove(onSuccess: (id: string) => void) {
  const submitting = ref(false);

  async function submit(item: Pick<ApiManagement.AssetImage, 'id' | 'folderId'>, folderId: string | null) {
    if (!folderId || folderId === item.folderId || submitting.value) return;
    submitting.value = true;
    try {
      const { data, error } = await fetchAssetImageMove({ id: item.id, folderId });
      if (error || !data) return;
      window.$message?.success('图片已移动');
      onSuccess(item.id);
    } finally {
      submitting.value = false;
    }
  }

  return { submitting, submit };
}
