import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

const mocks = vi.hoisted(() => ({
  fetchAuthRefresh: vi.fn(),
  resetStore: vi.fn(),
  messageError: vi.fn()
}));

vi.mock('@/service/api', () => ({ fetchAuthRefresh: mocks.fetchAuthRefresh }));
vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({ resetStore: mocks.resetStore })
}));
vi.mock('@/locales', () => ({ $t: (key: string) => key }));

import { localStg } from '@/utils/storage';
import { request } from '@/service/request';

type TestAdapter = AxiosAdapter & {
  mock: { calls: Array<[InternalAxiosRequestConfig]> };
};

function responseAdapter(responses: Array<{ code: number; data: unknown; message?: string }>): TestAdapter {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    const response = responses.shift();
    if (!response) throw new Error('未配置测试响应');
    return {
      data: {
        code: response.code,
        message: response.message ?? 'response',
        data: response.data
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config as InternalAxiosRequestConfig,
      request: {}
    };
  });
  return adapter as unknown as TestAdapter;
}

describe('请求实例的后端错误码契约', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    request.state.errMsgStack = [];
    request.state.refreshTokenPromise = null;
    localStg.clear();
    window.$message = { error: mocks.messageError } as never;
  });

  it('成功响应返回业务数据，并自动携带当前访问令牌', async () => {
    localStg.set('token', 'access-token');
    const adapter = responseAdapter([{ code: 0, data: { isActive: 1 } }]);

    const result = await request({ url: '/admin/me', adapter });

    expect(result.data).toEqual({ isActive: true });
    expect(adapter).toHaveBeenCalledOnce();
    expect(adapter.mock.calls[0][0].headers?.Authorization).toBe('Bearer access-token');
  });

  it('访问令牌失效时只刷新一次并重试原请求', async () => {
    localStg.set('refreshToken', 'old-refresh');
    mocks.fetchAuthRefresh.mockResolvedValue({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
      error: null
    });
    const adapter = responseAdapter([
      { code: 40100, data: null, message: '登录状态已失效' },
      { code: 0, data: { id: 'admin-1' } }
    ]);

    const result = await request({ url: '/admin/me', adapter });

    expect(result.data).toEqual({ id: 'admin-1' });
    expect(mocks.fetchAuthRefresh).toHaveBeenCalledOnce();
    expect(localStg.get('token')).toBe('new-access');
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(adapter.mock.calls[1][0].headers?.Authorization).toBe('Bearer new-access');
  });

  it('刷新令牌失效时清理登录状态，不进入重复刷新循环', async () => {
    localStg.set('refreshToken', 'invalid-refresh');
    mocks.fetchAuthRefresh.mockResolvedValue({
      data: null,
      error: new Error('refresh failed')
    });
    const adapter = responseAdapter([{ code: 40100, data: null, message: '登录状态已失效' }]);

    const result = await request({ url: '/admin/me', adapter });

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(AxiosError);
    expect(mocks.fetchAuthRefresh).toHaveBeenCalledOnce();
    expect(mocks.resetStore).toHaveBeenCalledOnce();
    expect(adapter).toHaveBeenCalledOnce();
  });

  it('主动注销业务码直接清理认证状态，网络异常只提示不清理登录状态', async () => {
    const logoutAdapter = responseAdapter([{ code: 40101, data: null, message: '刷新令牌无效' }]);
    const logoutResult = await request({
      url: '/auth/refresh',
      adapter: logoutAdapter
    });
    expect(logoutResult.data).toBeNull();
    expect(mocks.resetStore).toHaveBeenCalledOnce();
    expect(mocks.fetchAuthRefresh).not.toHaveBeenCalled();

    vi.clearAllMocks();
    window.$message = { error: mocks.messageError } as never;
    const networkAdapter = vi.fn(async () => {
      throw new AxiosError('network down');
    }) as unknown as AxiosAdapter;
    const networkResult = await request({
      url: '/admin/me',
      adapter: networkAdapter
    });
    expect(networkResult.data).toBeNull();
    expect(mocks.resetStore).not.toHaveBeenCalled();
    expect(networkResult.error).toBeInstanceOf(AxiosError);
  });
  it('模态注销错误码只弹出一次确认框，确认后清理去重状态', async () => {
    vi.stubEnv('VITE_SERVICE_MODAL_LOGOUT_CODES', '40901');
    const dialog = vi.fn();
    window.$dialog = { error: dialog } as never;
    const adapter = responseAdapter([{ code: 40901, data: null, message: '会话需要确认' }]);

    const result = await request({ url: '/admin/me', adapter });

    expect(result.data).toBeNull();
    expect(dialog).toHaveBeenCalledOnce();
    expect(request.state.errMsgStack).toEqual(['会话需要确认']);
    const options = dialog.mock.calls[0]?.[0] as {
      onPositiveClick: () => void;
    };
    options.onPositiveClick();
    expect(mocks.resetStore).toHaveBeenCalledOnce();
    expect(request.state.errMsgStack).toEqual([]);
    vi.unstubAllEnvs();
  });
});
