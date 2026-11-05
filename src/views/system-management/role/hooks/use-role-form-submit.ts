import { ref } from 'vue';
import { createRole, updateRole } from '@/service/api';
import { createRoleForm, toRoleForm } from '../config/constants';
import type { RoleFormModel } from '../typings';

interface RoleFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 角色新增和编辑表单，角色编码创建后不可修改。 */
export function useRoleFormSubmit(options: RoleFormSubmitOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const editing = ref<ApiManagement.Role | null>(null);
  const form = ref<RoleFormModel>(createRoleForm());

  function openCreate() {
    editing.value = null;
    form.value = createRoleForm();
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Role) {
    editing.value = row;
    form.value = toRoleForm(row);
    showModal.value = true;
  }

  async function submit() {
    const target = editing.value;
    if (submitting.value) return;

    submitting.value = true;
    try {
      const result = target
        ? await updateRole({
            id: target.id,
            name: form.value.name,
            description: form.value.description.trim() || null,
            isActive: form.value.isActive
          })
        : await createRole({
            code: form.value.code,
            name: form.value.name,
            description: form.value.description.trim() || null
          });

      if (result.error) return;

      window.$message?.success(target ? '角色已更新' : '角色已创建');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, editing, form, openCreate, openEdit, submit };
}
