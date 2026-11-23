import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchAuthRefresh: vi.fn(),
  resetStore: vi.fn()
}));

vi.mock('@/service/api', () => ({ fetchAuthRefresh: mocks.fetchAuthRefresh }));
vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({ resetStore: mocks.resetStore })
}));

import { localStg } from '@/utils/storage';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from '@/service/request/shared';

describe('请求认证状态共享逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStg.clear();
  });

  it('根据本地访问令牌生成 Bearer 认证头，缺失时返回 null', () => {
    expect(getAuthorization()).toBeNull();
    localStg.set('token', 'access-token');
    expect(getAuthorization()).toBe('Bearer access-token');
  });

  it('并发过期请求共享一次刷新，并保存新的令牌', async () => {
    localStg.set('refreshToken', 'refresh-token');
    mocks.fetchAuthRefresh.mockResolvedValue({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
      error: null
    });
    const state = { refreshTokenPromise: null, errMsgStack: [] };

    const [first, second] = await Promise.all([handleExpiredRequest(state), handleExpiredRequest(state)]);

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(mocks.fetchAuthRefresh).toHaveBeenCalledOnce();
    expect(localStg.get('token')).toBe('new-access');
    expect(localStg.get('refreshToken')).toBe('new-refresh');
  });

  it('刷新失败时清理认证状态并返回 false', async () => {
    localStg.set('refreshToken', 'refresh-token');
    mocks.fetchAuthRefresh.mockResolvedValue({
      data: null,
      error: new Error('expired')
    });
    const state = { refreshTokenPromise: null, errMsgStack: [] };

    await expect(handleExpiredRequest(state)).resolves.toBe(false);
    expect(mocks.resetStore).toHaveBeenCalledOnce();
  });

  it('同一消息只显示一次，离开后从去重栈移除', () => {
    let onLeave!: () => void;
    window.$message = {
      error: vi.fn((_message: string, options: { onLeave: () => void }) => {
        onLeave = options.onLeave;
      })
    } as never;
    const state = { refreshTokenPromise: null, errMsgStack: [] };

    showErrorMsg(state, '请求失败');
    showErrorMsg(state, '请求失败');
    expect((window.$message as { error: ReturnType<typeof vi.fn> }).error).toHaveBeenCalledOnce();
    expect(state.errMsgStack).toEqual(['请求失败']);

    onLeave();
    expect(state.errMsgStack).toEqual([]);
  });
});
