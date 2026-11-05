import { ref } from 'vue';
import { encryptPassword } from '@/utils/security';
import { resetAdminPassword } from '@/service/api';
import { createAdminPasswordForm } from '../config/constants';
import type { AdminPasswordFormModel } from '../typings';

interface AdminPasswordResetOptions {
  onSuccess?: () => void | Promise<void>;
}

/** 管理员密码重置，后端要求同时提交新密码和当前登录管理员密码的密文。 */
export function useAdminPasswordReset(options: AdminPasswordResetOptions = {}) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminPasswordFormModel>(createAdminPasswordForm());

  function open(row: ApiManagement.Admin) {
    target.value = row;
    form.value = createAdminPasswordForm();
    showModal.value = true;
  }

  async function submit() {
    const admin = target.value;
    if (!admin || submitting.value) return;

    submitting.value = true;
    try {
      const { error } = await resetAdminPassword({
        id: admin.id,
        password: await encryptPassword(form.value.password),
        currentPassword: await encryptPassword(form.value.currentPassword)
      });
      if (error) return;

      window.$message?.success('密码已重置');
      showModal.value = false;
      await options.onSuccess?.();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, target, form, open, submit };
}
