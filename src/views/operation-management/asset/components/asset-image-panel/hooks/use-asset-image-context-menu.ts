import { computed, shallowRef } from 'vue';
import type { AssetImageActionOption } from '@/views/operation-management/asset/typings';

type Image = ApiManagement.AssetImage;
type MenuPosition = { x: number; y: number };

/** 独立记录右键目标，避免菜单动作误用详情区的选中项。 */
export function useAssetImageContextMenu(getActions: (item: Image) => AssetImageActionOption[]) {
  const target = shallowRef<Image | null>(null);
  const position = shallowRef<MenuPosition>({ x: 0, y: 0 });
  const options = computed(() => (target.value ? getActions(target.value) : []));

  function open(item: Image, at: MenuPosition) {
    position.value = at;
    target.value = item;
  }

  function close() {
    target.value = null;
  }

  function takeAction(key: string | number) {
    const item = target.value;
    const option = options.value.find(entry => entry.key === key);
    close();
    return item && option ? { action: option.key, item } : null;
  }

  return { target, position, options, open, close, takeAction };
}
