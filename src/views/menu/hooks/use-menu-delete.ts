import { softDeleteMenu } from '@/service/api';

interface MenuDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 删除菜单并在成功后通知页面刷新列表。 */
export function useMenuDelete(options: MenuDeleteOptions) {
  async function remove(row: ApiManagement.Menu) {
    const result = await softDeleteMenu({ id: row.id });
    if (!result.error) await options.onSuccess();
  }

  return { remove };
}
