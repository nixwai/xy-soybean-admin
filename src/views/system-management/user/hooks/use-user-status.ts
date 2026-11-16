import { ref } from 'vue';
import { updateUser } from '@/service/api';

interface UserStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 用户启用和停用动作，成功后由调用方刷新列表。 */
export function useUserStatus(options: UserStatusOptions) {
  /** 正在提交启停请求的用户 ID，用于表格行内加载态和防重复提交。 */
  const pendingId = ref('');

  async function toggle(row: ApiManagement.User) {
    if (pendingId.value) return;

    pendingId.value = row.id;
    try {
      const { error } = await updateUser({ id: row.id, isActive: !row.isActive });
      if (error) return;

      window.$message?.success(row.isActive ? '用户已停用' : '用户已启用');
      await options.onSuccess();
    } finally {
      pendingId.value = '';
    }
  }

  return { pendingId, toggle };
}
