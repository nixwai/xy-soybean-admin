import type { AssetTreeOption } from '../typings';

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
