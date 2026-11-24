import type { MenuQueryModel, MenuTreeNode } from '../typings';
import { buildMenuTree } from './menu-tree';

function includesValue(value: string | null | undefined, expected: string) {
  return value?.toLocaleLowerCase().includes(expected) ?? false;
}

function matchesMenu(node: MenuTreeNode, query: MenuQueryModel) {
  const matchesField = (value: string | null | undefined, expected: string) =>
    !expected || includesValue(value, expected.toLocaleLowerCase());
  const matchesFields =
    matchesField(node.title, query.title) &&
    matchesField(node.menuKey, query.menuKey) &&
    matchesField(node.path, query.path) &&
    matchesField(node.permissionCode, query.permissionCode);
  const matchesStatus = query.statusFilter === null || node.isActive === (query.statusFilter === 'active');
  const matchesPermission =
    query.permissionFilter === null || node.permissionAvailable === (query.permissionFilter === 'available');

  return matchesFields && matchesStatus && matchesPermission;
}

/** 在不修改原树的前提下保留命中菜单及其必要祖先。 */
export function filterMenuTree(nodes: MenuTreeNode[], query: MenuQueryModel): MenuTreeNode[] {
  return nodes.flatMap(node => {
    const children = filterMenuTree(node.children ?? [], query);
    if (!matchesMenu(node, query) && !children.length) return [];
    return [{ ...node, ...(children.length ? { children } : {}) }];
  });
}

/** 过滤平铺菜单记录，供树形表格重新组装。 */
export function filterMenuItems(items: ApiManagement.Menu[], query: MenuQueryModel): ApiManagement.Menu[] {
  const tree = buildMenuTree(items);
  const filtered = filterMenuTree(tree, query);
  const result = new Set(filtered.flatMap(node => flattenMenuTree(node)).map(item => item.menuKey));
  return items.filter(item => result.has(item.menuKey));
}

function flattenMenuTree(node: MenuTreeNode): MenuTreeNode[] {
  return [node, ...(node.children ?? []).flatMap(child => flattenMenuTree(child))];
}
