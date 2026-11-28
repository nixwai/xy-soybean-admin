import { computed } from 'vue';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { getAssetImageActionOptions } from '../utils/asset-image-actions';

/** 读取图片权限，保证列表菜单和详情按钮使用同一权限判断。 */
export function useAssetImageAccess() {
  const { hasAuth } = useAuth();
  const authStore = useAuthStore();
  const canRead = computed(() => hasAuth(PERMISSION_CODE.ASSET_IMAGE_READ));

  function getImageActions(item: ApiManagement.AssetImage) {
    return canRead.value ? getAssetImageActionOptions(item, authStore.userInfo.userId, hasAuth) : [];
  }

  return { canRead, getImageActions };
}
