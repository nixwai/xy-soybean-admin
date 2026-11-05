import { ref } from 'vue';
import { createMenu, updateMenu } from '@/service/api';
import { createMenuForm, toMenuForm } from '../config/constants';
import type { MenuFormModel } from '../typings';

interface MenuFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 菜单新增和编辑表单，更新接口要求提交完整字段。 */
export function useMenuFormSubmit(options: MenuFormSubmitOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const editing = ref<ApiManagement.Menu | null>(null);
  const form = ref<MenuFormModel>(createMenuForm());

  /** 打开新增弹窗，可预填父级菜单和排序值。 */
  function openCreate(order = 0, parentId: string | null = null) {
    editing.value = null;
    form.value = createMenuForm(order, parentId);
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Menu) {
    editing.value = row;
    form.value = toMenuForm(row);
    showModal.value = true;
  }

  async function submit() {
    const target = editing.value;
    if (submitting.value) return;

    submitting.value = true;
    try {
      const payload: ApiManagement.MenuCreateRequest = {
        parentId: form.value.parentId || null,
        title: form.value.title.trim(),
        path: form.value.path.trim(),
        icon: form.value.icon.trim() || undefined,
        order: form.value.order,
        permissionCode: form.value.permissionCode || null,
        isRootOnly: form.value.isRootOnly
      };

      const result = target
        ? await updateMenu({ ...payload, id: target.id, isActive: form.value.isActive })
        : await createMenu(payload);

      if (result.error) return;

      window.$message?.success(target ? '菜单已更新' : '菜单已创建');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, editing, form, openCreate, openEdit, submit };
}
