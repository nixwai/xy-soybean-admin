import { computed, reactive, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { DropdownOption, TreeOption } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import type { AssetTreeOption } from '../typings';

/** 管理素材文件夹树的右键目标、菜单选项和关闭行为。 */
export function useAssetFolderContextMenu() {
  const { hasAuth } = useAuth();
  const authStore = useAuthStore();
  const contextMenu = reactive({ show: false, x: 0, y: 0 });
  const contextTarget = ref<AssetTreeOption | null>(null);
  /** 当前右键节点可执行的操作，跨账号操作额外要求全局素材管理权限。 */
  const contextOptions = computed<DropdownOption[]>(() => {
    const target = contextTarget.value;
    if (!target) return [];
    const options: DropdownOption[] = [];
    if (canOperate(target, PERMISSION_CODE.ASSET_FOLDER_CREATE)) {
      options.push({ label: '新建子文件夹', key: 'create' });
    }
    if (target.nodeType === 'folder' && canOperate(target, PERMISSION_CODE.ASSET_FOLDER_UPDATE)) {
      options.push({ label: '重命名', key: 'rename' });
    }
    if (target.nodeType === 'folder' && canOperate(target, PERMISSION_CODE.ASSET_FOLDER_DELETE)) {
      options.push({ label: '删除', key: 'delete' });
    }
    return options;
  });

  function canOperate(target: AssetTreeOption, permission: string) {
    if (!hasAuth(permission)) return false;
    return target.ownerId === authStore.userInfo.userId || hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL);
  }

  function nodeProps({ option }: { option: TreeOption }) {
    const target = option as AssetTreeOption;
    return {
      onContextmenu: (event: MouseEvent) => {
        event.preventDefault();
        contextTarget.value = target;
        contextMenu.x = event.clientX;
        contextMenu.y = event.clientY;
        contextMenu.show = contextOptions.value.length > 0;
      }
    };
  }

  function closeContextMenu() {
    contextMenu.show = false;
  }

  useEventListener('click', closeContextMenu);

  return {
    closeContextMenu,
    contextMenu,
    contextOptions,
    contextTarget,
    nodeProps
  };
}
