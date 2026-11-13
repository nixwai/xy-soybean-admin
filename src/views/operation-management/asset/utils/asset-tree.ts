import type { AssetTreeOption } from '../typings';

/** 账号根节点标识前缀，避免与文件夹主键冲突。 */
const OWNER_KEY_PREFIX = 'owner:';

/** 将后端按账号分组的文件夹树转换为 Naive UI 树节点。 */
export function buildAssetTree(owners: ApiManagement.AssetFolderOwnerTree[]): AssetTreeOption[] {
  const buildFolders = (items: ApiManagement.AssetFolderTreeNode[], ownerId: string): AssetTreeOption[] =>
    items.map(item => ({
      key: item.id,
      label: item.name,
      nodeType: 'folder' as const,
      ownerId,
      children: buildFolders(item.children, ownerId)
    }));

  return owners.map(group => ({
    key: `${OWNER_KEY_PREFIX}${group.owner.id}`,
    label: group.owner.username,
    nodeType: 'owner' as const,
    ownerId: group.owner.id,
    children: buildFolders(group.children, group.owner.id)
  }));
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
