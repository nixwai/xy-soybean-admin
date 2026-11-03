import { ref } from 'vue';
import { createMenu, updateMenu } from '@/service/api';
import { createMenuForm, toMenuForm } from '../config/constants';
import type { MenuFormModel } from '../typings';

interface MenuFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 菜单新增和编辑表单。 */
export function useMenuFormSubmit(options: MenuFormSubmitOptions) {
  const showModal = ref(false);
  const editing = ref<ApiManagement.Menu | null>(null);
  const form = ref<MenuFormModel>(createMenuForm());

  function openCreate(order: number) {
    editing.value = null;
    form.value = createMenuForm(order);
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Menu) {
    editing.value = row;
    form.value = toMenuForm(row);
    showModal.value = true;
  }

  async function submit() {
    if (!form.value.title || !form.value.path) return;
    const data = {
      parentId: form.value.parentId || null,
      title: form.value.title,
      path: form.value.path,
      icon: form.value.icon || undefined,
      order: Number(form.value.order),
      permissionCode: form.value.permissionCode || null,
      ...(editing.value ? { id: editing.value.id, isActive: form.value.isActive } : {})
    };
    const result = editing.value ? await updateMenu(data as ApiManagement.MenuUpdateRequest) : await createMenu(data);
    if (!result.error) {
      showModal.value = false;
      await options.onSuccess();
    }
  }

  return { showModal, editing, form, openCreate, openEdit, submit };
}
