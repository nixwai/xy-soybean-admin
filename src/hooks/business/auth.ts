import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

/** 提供基于后端权限编码的页面级和按钮级鉴权判断。 */
export function useAuth() {
  const authStore = useAuthStore();

  /** 是否为后端根管理员，根管理员拥有全部权限编码。 */
  const isRootAdmin = computed(() => authStore.isRootAdmin);

  /** 判断当前管理员是否命中任一权限编码，根管理员恒为真。 */
  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    if (authStore.isRootAdmin) {
      return true;
    }

    const codeList = typeof codes === 'string' ? [codes] : codes;

    return codeList.some(code => authStore.userInfo.permissions.includes(code));
  }

  return {
    isRootAdmin,
    hasAuth
  };
}
