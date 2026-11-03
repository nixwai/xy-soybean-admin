import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { localStg } from '@/utils/storage';
import { fetchGetUserInfo, fetchLogin, fetchLogout } from '@/service/api';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import { SetupStoreId } from '@/enum';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();
  const token = ref('');
  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: [],
    permissions: [],
    menus: []
  });

  const isStaticSuper = computed(() => Boolean(userInfo.isSuperAdmin));
  const isLogin = computed(() => Boolean(token.value));

  /** 清理本地认证状态并返回登录页。 */
  async function resetStore() {
    const refreshToken = localStg.get('refreshToken');
    if (refreshToken) {
      await fetchLogout(refreshToken).catch(() => undefined);
    }
    clearAuthStorage();
    authStore.$reset();
    if (!route.meta.constant) await toLogin();
    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** 使用接口返回的访问令牌加载管理员授权信息。 */
  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    localStg.set('token', loginToken.accessToken);
    localStg.set('refreshToken', loginToken.refreshToken);
    const pass = await getUserInfo();
    if (pass) {
      token.value = loginToken.accessToken;
      return true;
    }
    return false;
  }

  /** 提交管理员登录凭据。 */
  async function login(username: string, password: string, redirect = true) {
    startLoading();
    try {
      const { data: loginToken, error } = await fetchLogin(username, password);
      if (error || !loginToken) {
        await resetStore();
        return false;
      }
      const pass = await loginByToken(loginToken);
      if (!pass) {
        await resetStore();
        return false;
      }
      await redirectFromLogin(redirect);
      window.$notification?.success({
        title: $t('page.login.common.loginSuccess'),
        content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
        duration: 4500
      });
      return true;
    } finally {
      endLoading();
    }
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();
    if (error || !info) return false;
    Object.assign(userInfo, {
      userId: info.id,
      userName: info.username,
      roles: info.isSuperAdmin ? ['admin'] : info.roleIds,
      buttons: info.permissions,
      permissions: info.permissions,
      menus: info.menus,
      isSuperAdmin: Boolean(info.isSuperAdmin)
    });
    return true;
  }

  async function initUserInfo() {
    const maybeToken = getToken();
    if (!maybeToken) return;
    token.value = maybeToken;
    if (!(await getUserInfo())) await resetStore();
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo
  };
});
