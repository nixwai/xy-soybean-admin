import { ref } from 'vue';
import { encryptPassword } from '@/utils/security';
import { bindAdminRole, createAdmin, unbindAdminRole, updateAdmin } from '@/service/api';
import { createAdminForm } from '../config/constants';
import type { AdminFormModel } from '../typings';

interface AdminFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 管理员新增、编辑和角色绑定表单。 */
export function useAdminFormSubmit(options: AdminFormSubmitOptions) {
  const showModal = ref(false);
  const editing = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminFormModel>(createAdminForm());

  function openCreate() {
    editing.value = null;
    form.value = createAdminForm();
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Admin) {
    editing.value = row;
    form.value = {
      username: row.username,
      password: '',
      isSuperAdmin: row.isSuperAdmin,
      currentPassword: '',
      roleIds: [...row.roleIds]
    };
    showModal.value = true;
  }

  async function syncRoles(adminId: string, previousRoleIds: string[]) {
    const nextRoleIds = new Set(form.value.roleIds);
    const oldRoleIds = new Set(previousRoleIds);
    await Promise.all(
      [...nextRoleIds].filter(roleId => !oldRoleIds.has(roleId)).map(roleId => bindAdminRole({ adminId, roleId }))
    );
    await Promise.all(
      [...oldRoleIds].filter(roleId => !nextRoleIds.has(roleId)).map(roleId => unbindAdminRole({ adminId, roleId }))
    );
  }

  async function submit() {
    if (!form.value.username || (!editing.value && !form.value.password)) return;
    const password = form.value.password ? await encryptPassword(form.value.password) : undefined;
    const currentPassword = form.value.currentPassword ? await encryptPassword(form.value.currentPassword) : undefined;
    const result = editing.value
      ? await updateAdmin({
          id: editing.value.id,
          username: form.value.username,
          isSuperAdmin: form.value.isSuperAdmin,
          ...(password ? { password } : {}),
          ...(currentPassword ? { currentPassword } : {})
        })
      : await createAdmin({
          username: form.value.username,
          password: password || '',
          isSuperAdmin: form.value.isSuperAdmin,
          ...(currentPassword ? { currentPassword } : {})
        });

    if (!result.error && result.data) {
      await syncRoles(result.data.id, editing.value?.roleIds || []);
      window.$message?.success(editing.value ? '管理员已更新' : '管理员已创建');
      showModal.value = false;
      await options.onSuccess();
    }
  }

  return { showModal, editing, form, openCreate, openEdit, submit };
}
