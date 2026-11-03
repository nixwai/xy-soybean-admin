import { softDeleteRole } from '@/service/api';

interface RoleDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 删除角色并在成功后通知页面刷新列表。 */
export function useRoleDelete(options: RoleDeleteOptions) {
  async function remove(row: ApiManagement.Role) {
    const result = await softDeleteRole({ id: row.id });
    if (!result.error) await options.onSuccess();
  }

  return { remove };
}
