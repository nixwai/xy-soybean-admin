import { ref } from 'vue';
import { updateAdmin } from '@/service/api';

interface AdminStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 管理员启用和停用，根管理员的状态变更需通过编辑表单复核当前密码。 */
export function useAdminStatus(options: AdminStatusOptions) {
  /** 正在提交启停请求的管理员 ID，用于表格行内加载态。 */
  const pendingId = ref('');

  async function toggle(row: ApiManagement.Admin) {
    if (pendingId.value) return;

    pendingId.value = row.id;
    try {
      const { error } = await updateAdmin({ id: row.id, isActive: !row.isActive });
      if (error) return;

      window.$message?.success(row.isActive ? '管理员已停用' : '管理员已启用');
      await options.onSuccess();
    } finally {
      pendingId.value = '';
    }
  }

  return { pendingId, toggle };
}
