import { ref } from 'vue';
import { bindRolePermission, createRole, unbindRolePermission, updateRole } from '@/service/api';
import { createRoleForm } from '../config/constants';
import type { RoleFormModel } from '../typings';

interface RoleFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 角色新增、编辑和权限绑定表单。 */
export function useRoleFormSubmit(options: RoleFormSubmitOptions) {
  const showModal = ref(false);
  const editing = ref<ApiManagement.Role | null>(null);
  const form = ref<RoleFormModel>(createRoleForm());

  function openCreate() {
    editing.value = null;
    form.value = createRoleForm();
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Role) {
    editing.value = row;
    form.value = {
      code: row.code,
      name: row.name,
      description: row.description || '',
      isActive: row.isActive,
      permissionIds: [...row.permissionIds]
    };
    showModal.value = true;
  }

  async function syncPermissions(roleId: string, previousPermissionIds: string[]) {
    const next = new Set(form.value.permissionIds);
    const old = new Set(previousPermissionIds);
    await Promise.all(
      [...next].filter(id => !old.has(id)).map(permissionId => bindRolePermission({ roleId, permissionId }))
    );
    await Promise.all(
      [...old].filter(id => !next.has(id)).map(permissionId => unbindRolePermission({ roleId, permissionId }))
    );
  }

  async function submit() {
    if (!form.value.name || (!editing.value && !form.value.code)) return;
    const result = editing.value
      ? await updateRole({
          id: editing.value.id,
          name: form.value.name,
          description: form.value.description,
          isActive: form.value.isActive
        })
      : await createRole({ code: form.value.code, name: form.value.name, description: form.value.description });

    if (!result.error && result.data) {
      await syncPermissions(result.data.id, editing.value?.permissionIds || []);
      window.$message?.success(editing.value ? '角色已更新' : '角色已创建');
      showModal.value = false;
      await options.onSuccess();
    }
  }

  return { showModal, editing, form, openCreate, openEdit, submit };
}
