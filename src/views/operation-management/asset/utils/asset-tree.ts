import type { AssetTreeOption, AssetTreeQueryModel } from '../typings';

/** 账号根节点标识前缀，避免与文件夹主键冲突。 */
const OWNER_KEY_PREFIX = 'owner:';

/** 构建账号虚拟根节点，个人视图顶层新建也复用该目标节点。 */
export function createOwnerAssetNode(owner: ApiManagement.AssetFolderAccount): AssetTreeOption {
  return {
    key: `${OWNER_KEY_PREFIX}${owner.id}`,
    label: owner.username,
    nodeType: 'owner',
    ownerId: owner.id
  };
}

/** 递归转换文件夹，叶子节点不携带 children，避免 Naive UI 渲染展开图标。 */
const buildFolders = (items: ApiManagement.AssetFolderTreeNode[], ownerId: string): AssetTreeOption[] =>
  items.map(item => ({
    key: item.id,
    label: item.name,
    nodeType: 'folder' as const,
    ownerId,
    children: item.children.length ? buildFolders(item.children, ownerId) : undefined
  }));

/** 将后端按账号分组的文件夹树转换为 Naive UI 树节点。 */
export function buildAssetTree(owners: ApiManagement.AssetFolderOwnerTree[]): AssetTreeOption[] {
  return owners.map(group => ({
    ...createOwnerAssetNode(group.owner),
    children: group.children.length ? buildFolders(group.children, group.owner.id) : undefined
  }));
}

/** 个人视图仅展示当前账号的顶层文件夹，不渲染账号根节点。 */
export function buildPersonalAssetTree(owners: ApiManagement.AssetFolderOwnerTree[]): AssetTreeOption[] {
  return owners.flatMap(group => buildFolders(group.children, group.owner.id));
}

/** 按节点标识深度查找树节点。 */
export function findAssetTreeNode(nodes: AssetTreeOption[], key?: string): AssetTreeOption | null {
  if (!key) return null;
  for (const node of nodes) {
    if (node.key === key) return node;
    const matched = findAssetTreeNode(node.children ?? [], key);
    if (matched) return matched;
  }
  return null;
}

/** 按文件夹名称或账号名称关键词过滤素材树，并保留命中节点的祖先路径。 */
export function filterAssetTree(nodes: AssetTreeOption[], query: AssetTreeQueryModel): AssetTreeOption[] {
  const keyword = query.keyword.toLocaleLowerCase();
  if (!keyword) return nodes.map(node => cloneAssetTreeNode(node));

  return nodes.flatMap(node => {
    if (node.label.toLocaleLowerCase().includes(keyword)) return [cloneAssetTreeNode(node)];
    const children = filterAssetTreeNodes(node.children ?? [], keyword);
    if (!children.length) return [];
    return [{ ...node, children }];
  });
}

function filterAssetTreeNodes(nodes: AssetTreeOption[], keyword: string): AssetTreeOption[] {
  return nodes.flatMap(node => {
    if (node.label.toLocaleLowerCase().includes(keyword)) return [cloneAssetTreeNode(node)];
    const children = filterAssetTreeNodes(node.children ?? [], keyword);
    if (!children.length) return [];
    return [{ ...node, children }];
  });
}

function cloneAssetTreeNode(node: AssetTreeOption): AssetTreeOption {
  return { ...node, ...(node.children ? { children: node.children.map(child => cloneAssetTreeNode(child)) } : {}) };
}
