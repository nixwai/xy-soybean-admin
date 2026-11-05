import { ref } from 'vue';
import { disablePermission, enablePermission } from '@/service/api';

interface PermissionStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 切换权限启用状态，停用后该权限不再参与授权计算和可分配目录。 */
export function usePermissionStatus(options: PermissionStatusOptions) {
  /** 正在提交启停请求的权限 ID，用于行内加载态。 */
  const pendingId = ref('');

  async function toggle(row: ApiManagement.Permission) {
    if (pendingId.value) return;

    pendingId.value = row.id;
    try {
      const { error } = row.isActive ? await disablePermission({ id: row.id }) : await enablePermission({ id: row.id });
      if (error) return;

      window.$message?.success(row.isActive ? '权限已停用' : '权限已启用');
      await options.onSuccess();
    } finally {
      pendingId.value = '';
    }
  }

  return { pendingId, toggle };
}
