import { ref } from 'vue';
import { encryptPassword } from '@/utils/security';
import { resetAdminPassword } from '@/service/api';
import { createAdminPasswordForm } from '../config/constants';
import type { AdminPasswordFormModel } from '../typings';

/** 管理员密码重置流程。 */
export function useAdminPasswordReset() {
  const showModal = ref(false);
  const target = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminPasswordFormModel>(createAdminPasswordForm());

  function open(row: ApiManagement.Admin) {
    target.value = row;
    form.value = createAdminPasswordForm();
    showModal.value = true;
  }

  async function submit() {
    if (!target.value || !form.value.password || !form.value.currentPassword) return;
    const result = await resetAdminPassword({
      id: target.value.id,
      password: await encryptPassword(form.value.password),
      currentPassword: await encryptPassword(form.value.currentPassword)
    });
    if (!result.error) {
      window.$message?.success('密码已重置');
      showModal.value = false;
    }
  }

  return { showModal, target, form, open, submit };
}
