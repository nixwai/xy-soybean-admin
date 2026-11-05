import { computed, ref } from 'vue';
import { encryptPassword } from '@/utils/security';
import { createAdmin, updateAdmin } from '@/service/api';
import { createAdminForm, toAdminForm } from '../config/constants';
import type { AdminFormModel } from '../typings';

interface AdminFormSubmitOptions {
  onSuccess: () => void | Promise<void>;
}

/** 管理员新增和编辑表单，密码字段在提交前完成 RSA 加密。 */
export function useAdminFormSubmit(options: AdminFormSubmitOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const editing = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminFormModel>(createAdminForm());

  /**
   * 是否需要复核当前登录管理员密码。
   *
   * 后端在创建根管理员、修改密码、变更根管理员身份，以及目标本身为根管理员时强制校验当前密码。
   */
  const needCurrentPassword = computed(
    () => Boolean(editing.value?.isRoot) || form.value.isRoot || Boolean(form.value.password)
  );

  function openCreate() {
    editing.value = null;
    form.value = createAdminForm();
    showModal.value = true;
  }

  function openEdit(row: ApiManagement.Admin) {
    editing.value = row;
    form.value = toAdminForm(row);
    showModal.value = true;
  }

  async function submit() {
    const target = editing.value;
    if (submitting.value) return;

    submitting.value = true;
    try {
      const currentPassword = form.value.currentPassword
        ? await encryptPassword(form.value.currentPassword)
        : undefined;

      const result = target
        ? await updateAdmin({
            id: target.id,
            username: form.value.username,
            isActive: form.value.isActive,
            isRoot: form.value.isRoot,
            ...(form.value.password ? { password: await encryptPassword(form.value.password) } : {}),
            ...(currentPassword ? { currentPassword } : {})
          })
        : await createAdmin({
            username: form.value.username,
            password: await encryptPassword(form.value.password),
            isRoot: form.value.isRoot,
            ...(currentPassword ? { currentPassword } : {})
          });

      if (result.error) return;

      window.$message?.success(target ? '管理员已更新' : '管理员已创建');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, editing, form, needCurrentPassword, openCreate, openEdit, submit };
}
