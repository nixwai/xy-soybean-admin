import type { TreeOption } from 'naive-ui';
import type { AssetAccess, AssetSelection } from '../typings';

/** 自有资源必须具备 read，他人资源必须具备对应 read-all，不能跨资源借权。 */
export function assetAccess(selfId: string, has: (code: string) => boolean): AssetAccess {
  const readAll = (resource: 'folder' | 'image') => has(`asset.${resource}.read-all`);
  const read = (resource: 'folder' | 'image', ownerId: string) =>
    ownerId === selfId ? has(`asset.${resource}.read`) : readAll(resource);
  return {
    showAll: readAll('folder') || readAll('image'),
    readAll,
    read,
    write: (resource, action, ownerId) =>
      Boolean(ownerId) && has(`asset.${resource}.${action}`) && read(resource, ownerId),
    target: (ownerId, folderId) => !folderId || read('folder', ownerId)
  };
}

export function ownerLabel(id: string, selfId: string, username: string, owners: ApiManagement.AssetOwner[]) {
  return (id === selfId ? username : '') || owners.find(owner => owner.id === id)?.username || id;
}

export function buildAssetTree(
  scope: 'mine' | 'all',
  selfId: string,
  owners: ApiManagement.AssetOwner[],
  folders: ApiManagement.AssetFolder[],
  access: AssetAccess
): TreeOption[] {
  const children = (ownerId: string): TreeOption[] => {
    const visible = access.read('folder', ownerId) ? folders.filter(folder => folder.ownerId === ownerId) : [];
    const build = (parentId: string | null, visited: string[]): TreeOption[] =>
      visible
        .filter(folder => folder.parentId === parentId && !visited.includes(folder.id))
        .map(folder => ({
          key: folder.id,
          label: `${folder.name} (${folder.imageCount})`,
          children: build(folder.id, [...visited, folder.id])
        }));
    return [
      ...build(null, []),
      { key: `unclassified:${ownerId}`, label: '未分类', disabled: !access.read('image', ownerId) }
    ];
  };
  if (scope === 'mine')
    return [
      { key: `owner:${selfId}`, label: '全部图片', disabled: !access.read('image', selfId) },
      ...children(selfId)
    ];
  return [
    {
      key: 'root',
      label: '全部用户',
      children: owners.map(owner => ({
        key: `owner:${owner.id}`,
        label: `${owner.username}${owner.isActive ? '' : '（已停用）'}`,
        children: children(owner.id)
      }))
    }
  ];
}

export function imageQuery(
  selection: AssetSelection & { page: number; pageSize: number; keyword: string }
): ApiManagement.AssetQuery {
  return {
    page: selection.page,
    pageSize: selection.pageSize,
    keyword: selection.keyword.trim() || undefined,
    ownerId: selection.ownerId || undefined,
    ...(selection.unclassified ? { unclassified: true } : { folderId: selection.folderId || undefined })
  };
}
