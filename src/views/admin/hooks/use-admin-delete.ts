import { encryptPassword } from '@/utils/security';
import { softDeleteAdmin } from '@/service/api';

interface AdminDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 删除管理员并在成功后通知页面刷新列表。 */
export function useAdminDelete(options: AdminDeleteOptions) {
  async function remove(row: ApiManagement.Admin) {
    const currentPassword = window.prompt('请输入当前管理员密码');
    if (!currentPassword) return;
    const result = await softDeleteAdmin({ id: row.id, currentPassword: await encryptPassword(currentPassword) });
    if (!result.error) await options.onSuccess();
  }

  return { remove };
}
