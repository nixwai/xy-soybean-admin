import { ref } from 'vue';
import { encryptPassword } from '@/utils/security';
import { softDeleteAdmin } from '@/service/api';
import { createAdminDeleteForm } from '../config/constants';
import type { AdminDeleteModel } from '../typings';

interface AdminDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 管理员删除，后端强制复核当前登录管理员密码，因此使用弹窗替代浏览器原生输入框。 */
export function useAdminDelete(options: AdminDeleteOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminDeleteModel>(createAdminDeleteForm());

  function open(row: ApiManagement.Admin) {
    target.value = row;
    form.value = createAdminDeleteForm();
    showModal.value = true;
  }

  async function submit() {
    const admin = target.value;
    if (!admin || submitting.value) return;

    submitting.value = true;
    try {
      const { error } = await softDeleteAdmin({
        id: admin.id,
        currentPassword: await encryptPassword(form.value.currentPassword)
      });
      if (error) return;

      window.$message?.success('管理员已删除');
      showModal.value = false;
      await options.onSuccess();
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, target, form, open, submit };
}
