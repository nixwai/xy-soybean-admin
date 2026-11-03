import { disableMenu, enableMenu } from '@/service/api';

interface MenuStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 切换菜单启用状态。 */
export function useMenuStatus(options: MenuStatusOptions) {
  async function toggle(row: ApiManagement.Menu) {
    const result = row.isActive ? await disableMenu({ id: row.id }) : await enableMenu({ id: row.id });
    if (!result.error) await options.onSuccess();
  }

  return { toggle };
}
