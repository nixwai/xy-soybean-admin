import { ref, shallowRef } from 'vue';
import { fetchAssetImageUpdate } from '@/service/api';

type RenameTarget = Pick<ApiManagement.AssetImage, 'id' | 'originalName'>;

/** 管理图片重命名表单和提交，扩展名由服务端保留。 */
export function useAssetImageRename(onSuccess: () => void) {
  const visible = ref(false);
  const submitting = ref(false);
  const name = ref('');
  const target = shallowRef<RenameTarget | null>(null);

  function open(item: RenameTarget) {
    if (submitting.value) return;
    target.value = item;
    name.value = item.originalName.replace(/\.[^.]+$/, '');
    visible.value = true;
  }

  function close() {
    visible.value = false;
    target.value = null;
  }

  async function submit() {
    const item = target.value;
    const originalName = name.value.trim();
    if (!visible.value || !item || !originalName || submitting.value) return;

    submitting.value = true;
    try {
      const { data, error } = await fetchAssetImageUpdate({ id: item.id, originalName });
      if (error || !data) return;
      if (target.value === item) close();
      window.$message?.success('图片已重命名');
      onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { visible, submitting, name, open, close, submit };
}
