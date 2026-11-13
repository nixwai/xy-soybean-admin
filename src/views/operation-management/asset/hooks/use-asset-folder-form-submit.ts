import { computed, ref } from 'vue';
import { createAssetFolder, updateAssetFolder } from '@/service/api';
import { createAssetFolderForm } from '../config/constants';
import type { AssetFolderFormMode, AssetFolderFormModel, AssetTreeOption } from '../typings';

interface AssetFolderFormSubmitOptions {
  /** 提交成功后的刷新回调。 */
  onSuccess: () => void | Promise<void>;
}

/** 新建与重命名素材文件夹，表单模型、弹窗状态和目标节点由本 hook 自治。 */
export function useAssetFolderFormSubmit(options: AssetFolderFormSubmitOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const mode = ref<AssetFolderFormMode>('create');
  const target = ref<AssetTreeOption | null>(null);
  const form = ref<AssetFolderFormModel>(createAssetFolderForm());
  /** 新建时的父级展示名称，账号根节点表示建在账号下。 */
  const parentLabel = computed(() => (mode.value === 'create' ? (target.value?.label ?? '') : ''));

  /** 在指定节点下新建子文件夹。 */
  function openCreate(row: AssetTreeOption | null) {
    if (!row) return;
    mode.value = 'create';
    target.value = row;
    form.value = createAssetFolderForm();
    showModal.value = true;
  }

  /** 重命名指定文件夹。 */
  function openRename(row: AssetTreeOption | null) {
    if (!row || row.nodeType !== 'folder') return;
    mode.value = 'rename';
    target.value = row;
    form.value = { name: row.label };
    showModal.value = true;
  }

  /** 按当前模式提交新建或重命名，成功后关闭弹窗并刷新。 */
  async function submit() {
    const node = target.value;
    const name = form.value.name.trim();
    if (!node || !name || submitting.value) return;

    submitting.value = true;
    try {
      const result =
        mode.value === 'create'
          ? await createAssetFolder(
              node.nodeType === 'folder'
                ? { name, ownerId: node.ownerId, parentId: node.key }
                : { name, ownerId: node.ownerId }
            )
          : await updateAssetFolder({ id: node.key, name });
      if (result.error) return;

      window.$message?.success(mode.value === 'create' ? '文件夹已创建' : '文件夹已重命名');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, mode, form, parentLabel, openCreate, openRename, submit };
}
