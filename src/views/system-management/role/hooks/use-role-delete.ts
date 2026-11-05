import { softDeleteRole } from '@/service/api';

interface RoleDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 删除角色，受保护角色禁止删除，成功后由调用方刷新列表。 */
export function useRoleDelete(options: RoleDeleteOptions) {
  async function remove(row: ApiManagement.Role) {
    if (row.isProtected) {
      window.$message?.warning('受保护角色不允许删除');
      return;
    }

    const { error } = await softDeleteRole({ id: row.id });
    if (error) return;

    window.$message?.success('角色已删除');
    await options.onSuccess();
  }

  return { remove };
}
