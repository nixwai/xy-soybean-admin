import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import { normalizeBooleanFields } from './normalize';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

export const request = createFlatRequest(
  { baseURL },
  {
    defaultState: { errMsgStack: [], refreshTokenPromise: null } as RequestInstanceState,
    transform(response: AxiosResponse<App.Service.Response<any>>) {
      return normalizeBooleanFields(response.data.data);
    },
    async onRequest(config) {
      Object.assign(config.headers, { Authorization: getAuthorization() });
      return config;
    },
    isBackendSuccess(response) {
      return Number(response.data.code) === Number(import.meta.env.VITE_SERVICE_SUCCESS_CODE);
    },
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const responseCode = String(response.data.code);
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',').filter(Boolean) || [];
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',').filter(Boolean) || [];
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',').filter(Boolean) || [];
      const message = response.data.message || response.data.msg || '请求失败';

      if (logoutCodes.includes(responseCode)) {
        await authStore.resetStore();
        return null;
      }
      if (modalLogoutCodes.includes(responseCode)) {
        window.$dialog?.error({
          title: $t('common.error'),
          content: message,
          positiveText: $t('common.confirm'),
          onPositiveClick: () => authStore.resetStore()
        });
        return null;
      }
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          Object.assign(response.config.headers, { Authorization: getAuthorization() });
          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }
      return null;
    },
    onError(error) {
      let message = error.message;
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || error.response?.data?.msg || message;
      }
      showErrorMsg(request.state, message);
    }
  }
);

export const demoRequest = createRequest({ baseURL: otherBaseURL.demo });
