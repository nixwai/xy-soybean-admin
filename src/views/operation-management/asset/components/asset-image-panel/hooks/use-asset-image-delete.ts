import type { DialogOptions, DialogReactive } from 'naive-ui';
import { fetchAssetImageSoftDelete } from '@/service/api';

type DeleteTarget = Pick<ApiManagement.AssetImage, 'id' | 'originalName'>;
type ConfirmDelete = (options: DialogOptions) => DialogReactive | undefined;

/** 确认并软删除打开确认框时选中的图片。 */
export function useAssetImageDelete(
  onSuccess: (id: string) => void,
  confirm: ConfirmDelete = options => window.$dialog?.warning(options)
) {
  let active = false;
  let submitting = false;
  let dialog: DialogReactive | undefined;

  function open({ id, originalName }: DeleteTarget) {
    if (active) return;
    active = true;
    dialog = confirm({
      title: '删除图片',
      content: `确定删除“${originalName}”吗？`,
      positiveText: '删除',
      negativeText: '取消',
      onAfterLeave: () => {
        active = false;
        dialog = undefined;
      },
      onPositiveClick: async () => {
        if (submitting) return false;
        submitting = true;
        try {
          const { error } = await fetchAssetImageSoftDelete({ id });
          if (error) return false;
          window.$message?.success('图片已删除');
          onSuccess(id);
        } finally {
          submitting = false;
        }
      }
    });
    if (!dialog) active = false;
  }

  function close() {
    dialog?.destroy();
  }

  return { open, close };
}
