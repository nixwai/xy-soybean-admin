import { ref } from 'vue';
import { fetchAssetImageUpload } from '@/service/api';

/** 管理素材图片批量上传状态和结果反馈。 */
export function useAssetImageUpload() {
  const uploading = ref(false);

  /** 上传当前文件夹图片并返回成功、失败明细。 */
  async function upload(folderId: string, files: File[]) {
    if (!files.length) return null;
    uploading.value = true;
    try {
      const { data } = await fetchAssetImageUpload(folderId, files);
      return data;
    } finally {
      uploading.value = false;
    }
  }

  return { uploading, upload };
}
