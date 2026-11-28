import { PERMISSION_CODE } from '@/constants/permission';
import type { AssetImageActionOption } from '@/views/operation-management/asset/typings';

const actions = [
  { key: 'rename', label: '重命名', permission: PERMISSION_CODE.ASSET_IMAGE_UPDATE },
  { key: 'move', label: '修改位置', permission: PERMISSION_CODE.ASSET_IMAGE_MOVE },
  { key: 'copy', label: '复制链接', permission: null },
  { key: 'delete', label: '删除', permission: PERMISSION_CODE.ASSET_IMAGE_DELETE }
] as const;

/** 返回当前账号可操作的图片动作；能够查看图片即可复制链接。 */
export function getAssetImageActionOptions(
  item: Pick<ApiManagement.AssetImage, 'ownerId'>,
  actorId: string,
  hasAuth: (permission: string) => boolean
): AssetImageActionOption[] {
  const canManage = item.ownerId === actorId || hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL);
  return actions.flatMap(({ key, label, permission }) =>
    !permission || (canManage && hasAuth(permission)) ? [{ key, label }] : []
  );
}
