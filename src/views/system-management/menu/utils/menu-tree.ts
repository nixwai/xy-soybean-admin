import type { MenuTreeNode, MenuTreeOption } from '../typings';

/** 按后端排序字段和 ID 递归排序菜单树。 */
function sortMenuTree(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return nodes
    .sort((left, right) => left.order - right.order || Number(left.id) - Number(right.id))
    .map(node => ({ ...node, ...(node.children ? { children: sortMenuTree(node.children) } : {}) }));
}

/** 将扁平菜单列表构建为树，父级缺失的节点提升为根节点，避免数据在界面上丢失。 */
export function buildMenuTree(items: ApiManagement.Menu[]): MenuTreeNode[] {
  const nodeMap = new Map<string, MenuTreeNode>(items.map(item => [item.id, { ...item }]));
  const roots: MenuTreeNode[] = [];

  nodeMap.forEach(node => {
    const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;
    if (parent && parent !== node) {
      parent.children = [...(parent.children ?? []), node];
    } else {
      roots.push(node);
    }
  });

  return sortMenuTree(roots);
}

/** 收集指定菜单及其全部子孙的 ID，用于父级选择时排除自身分支。 */
export function collectMenuBranchIds(items: ApiManagement.Menu[], id: string): string[] {
  const childrenMap = new Map<string, string[]>();
  items.forEach(item => {
    if (!item.parentId) return;
    childrenMap.set(item.parentId, [...(childrenMap.get(item.parentId) ?? []), item.id]);
  });

  const branchIds: string[] = [];
  const walk = (currentId: string) => {
    branchIds.push(currentId);
    (childrenMap.get(currentId) ?? []).forEach(walk);
  };
  walk(id);

  return branchIds;
}

/** 将菜单树转换为父级选择器选项，排除指定分支以避免形成循环父子关系。 */
export function toMenuTreeOptions(nodes: MenuTreeNode[], excludedIds: string[] = []): MenuTreeOption[] {
  const excluded = new Set(excludedIds);

  return nodes
    .filter(node => !excluded.has(node.id))
    .map(node => ({
      label: node.title,
      key: node.id,
      ...(node.children?.length ? { children: toMenuTreeOptions(node.children, excludedIds) } : {})
    }));
}
