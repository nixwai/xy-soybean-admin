import { ref } from 'vue';
import { updateMenu } from '@/service/api';
import { toMenuForm } from '../config/constants';
import type { MenuFormModel } from '../typings';

interface MenuFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 菜单编辑表单；菜单新增、删除及元数据修改由后端种子配置维护。 */
export function useMenuFormSubmit(options: MenuFormSubmitOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const editing = ref<ApiManagement.Menu | null>(null);
  const form = ref<MenuFormModel>({ title: '', order: 0, isActive: true });

  function openEdit(row: ApiManagement.Menu) {
    editing.value = row;
    form.value = toMenuForm(row);
    showModal.value = true;
  }

  async function submit() {
    const target = editing.value;
    if (!target || submitting.value) return;
    submitting.value = true;
    try {
      const result = await updateMenu({
        id: target.id,
        title: form.value.title.trim(),
        order: form.value.order,
        isActive: form.value.isActive
      });
      if (result.error) return;
      window.$message?.success('菜单已更新');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, editing, form, openEdit, submit };
}
