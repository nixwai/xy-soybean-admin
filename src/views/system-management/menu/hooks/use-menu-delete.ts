import { softDeleteMenu } from '@/service/api';
import type { MenuTreeNode } from '../typings';

interface MenuDeleteOptions {
  onSuccess: () => void | Promise<void>;
}

/** 删除菜单，存在子菜单时禁止删除，避免子菜单因父级缺失而从菜单树中消失。 */
export function useMenuDelete(options: MenuDeleteOptions) {
  async function remove(row: MenuTreeNode) {
    if (row.children?.length) {
      window.$message?.warning('请先删除该菜单下的子菜单');
      return;
    }

    const { error } = await softDeleteMenu({ id: row.id });
    if (error) return;

    window.$message?.success('菜单已删除');
    await options.onSuccess();
  }

  return { remove };
}
