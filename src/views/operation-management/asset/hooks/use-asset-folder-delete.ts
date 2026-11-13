import { ref } from 'vue';
import { softDeleteAssetFolder } from '@/service/api';
import type { AssetTreeOption } from '../typings';

interface AssetFolderDeleteOptions {
  /** 删除成功后的刷新回调。 */
  onSuccess: () => void | Promise<void>;
}

/** 删除素材文件夹，确认弹窗状态和目标节点由本 hook 自治。 */
export function useAssetFolderDelete(options: AssetFolderDeleteOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<AssetTreeOption | null>(null);

  /** 打开删除确认，仅文件夹节点可删除。 */
  function open(row: AssetTreeOption | null) {
    if (!row || row.nodeType !== 'folder') return;
    target.value = row;
    showModal.value = true;
  }

  /** 提交软删除，成功后关闭弹窗并刷新。 */
  async function submit() {
    const node = target.value;
    if (!node || submitting.value) return;

    submitting.value = true;
    try {
      const { error } = await softDeleteAssetFolder({ id: node.key });
      if (error) return;

      window.$message?.success('文件夹已删除');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, target, open, submit };
}
