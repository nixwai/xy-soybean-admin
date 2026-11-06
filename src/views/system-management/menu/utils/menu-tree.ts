import type { MenuTreeNode } from '../typings';

function sortMenuTree(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return [...nodes]
    .sort((left, right) => left.order - right.order || left.menuKey.localeCompare(right.menuKey))
    .map(node => ({ ...node, ...(node.children ? { children: sortMenuTree(node.children) } : {}) }));
}

/** 按后端 parentKey 构建菜单树。 */
export function buildMenuTree(items: ApiManagement.Menu[]): MenuTreeNode[] {
  const nodeMap = new Map<string, MenuTreeNode>(items.map(item => [item.menuKey, { ...item }]));
  const roots: MenuTreeNode[] = [];
  nodeMap.forEach(node => {
    const parent = node.parentKey ? nodeMap.get(node.parentKey) : undefined;
    if (parent && parent !== node) parent.children = [...(parent.children ?? []), node];
    else roots.push(node);
  });
  return sortMenuTree(roots);
}
