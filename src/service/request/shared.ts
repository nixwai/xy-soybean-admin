import { localStg } from '@/utils/storage';
import { useAuthStore } from '@/store/modules/auth';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';

export function getAuthorization() {
  const token = localStg.get('token');
  return token ? `Bearer ${token}` : null;
}

async function handleRefreshToken() {
  const { resetStore } = useAuthStore();
  const refreshToken = localStg.get('refreshToken') || '';
  const { error, data } = await fetchRefreshToken(refreshToken);
  if (!error && data) {
    localStg.set('token', data.accessToken);
    localStg.set('refreshToken', data.refreshToken);
    return true;
  }
  await resetStore();
  return false;
}

export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenPromise) state.refreshTokenPromise = handleRefreshToken();
  const success = await state.refreshTokenPromise;
  setTimeout(() => {
    state.refreshTokenPromise = null;
  }, 1000);
  return success;
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (state.errMsgStack.includes(message)) return;
  state.errMsgStack = [...state.errMsgStack, message];
  window.$message?.error(message, {
    onLeave: () => {
      state.errMsgStack = state.errMsgStack.filter(item => item !== message);
    }
  });
}
