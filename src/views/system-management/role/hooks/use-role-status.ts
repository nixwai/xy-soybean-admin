import { ref } from 'vue';
import { updateRole } from '@/service/api';

interface RoleStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 角色启用和停用，受保护角色禁止切换以避免默认角色被停用后新建管理员无法绑定角色。 */
export function useRoleStatus(options: RoleStatusOptions) {
  /** 正在提交启停请求的角色 ID，用于表格行内加载态。 */
  const pendingId = ref('');

  async function toggle(row: ApiManagement.Role) {
    if (pendingId.value) return;

    if (row.isProtected) {
      window.$message?.warning('受保护角色不允许停用');
      return;
    }

    pendingId.value = row.id;
    try {
      const { error } = await updateRole({ id: row.id, isActive: !row.isActive });
      if (error) return;

      window.$message?.success(row.isActive ? '角色已停用' : '角色已启用');
      await options.onSuccess();
    } finally {
      pendingId.value = '';
    }
  }

  return { pendingId, toggle };
}
