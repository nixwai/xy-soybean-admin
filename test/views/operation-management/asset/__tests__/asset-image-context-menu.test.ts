import { describe, expect, it } from 'vitest';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAssetImageContextMenu } from '@/views/operation-management/asset/components/asset-image-panel/hooks/use-asset-image-context-menu';
import { getAssetImageActionOptions } from '@/views/operation-management/asset/components/asset-image-panel/utils/asset-image-actions';

const first = { id: '1', ownerId: '10' } as ApiManagement.AssetImage;
const second = { id: '2', ownerId: '20' } as ApiManagement.AssetImage;

describe('素材图片右键操作', () => {
  it('详情与菜单使用相同权限：本人按操作授权，管理他人素材还需要全局权限', () => {
    const allowed = new Set<string>([PERMISSION_CODE.ASSET_IMAGE_UPDATE, PERMISSION_CODE.ASSET_IMAGE_DELETE]);
    const getActions = (item: ApiManagement.AssetImage) =>
      getAssetImageActionOptions(item, '10', code => allowed.has(code));

    expect(getActions(first).map(option => option.key)).toEqual(['rename', 'copy', 'delete']);
    expect(getActions(second).map(option => option.key)).toEqual(['copy']);
    allowed.add(PERMISSION_CODE.ASSET_FOLDER_ALL);
    allowed.add(PERMISSION_CODE.ASSET_IMAGE_MOVE);
    expect(getActions(second).map(option => option.key)).toEqual(['rename', 'move', 'copy', 'delete']);
  });

  it('对最后右键点击的图片执行操作，并在关闭后清除目标', () => {
    const menu = useAssetImageContextMenu(item => getAssetImageActionOptions(item, '10', () => false));
    menu.open(first, { x: 2, y: 3 });
    menu.open(second, { x: 8, y: 9 });

    expect(menu.position.value).toEqual({ x: 8, y: 9 });
    expect(menu.takeAction('copy')).toEqual({ action: 'copy', item: second });
    expect(menu.target.value).toBeNull();
    expect(menu.takeAction('copy')).toBeNull();
  });

  it('选择时重新校验权限，取消后不再执行操作', () => {
    let canRename = true;
    const menu = useAssetImageContextMenu(item => getAssetImageActionOptions(item, '10', () => canRename));
    menu.open(first, { x: 0, y: 0 });
    canRename = false;
    expect(menu.takeAction('rename')).toBeNull();

    menu.open(first, { x: 0, y: 0 });
    menu.close();
    expect(menu.takeAction('copy')).toBeNull();
  });
});
