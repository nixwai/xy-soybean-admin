import { disablePermission, enablePermission } from '@/service/api';

interface PermissionStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 切换权限启用状态。 */
export function usePermissionStatus(options: PermissionStatusOptions) {
  async function toggle(row: ApiManagement.Permission) {
    const result = row.isActive ? await disablePermission({ id: row.id }) : await enablePermission({ id: row.id });
    if (!result.error) await options.onSuccess();
  }

  return { toggle };
}
