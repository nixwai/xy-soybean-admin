import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { fetchUserUpdate } from '@/service/api';
import { useUserStatus } from '@/views/system-management/user/hooks/use-user-status';

vi.mock('@/service/api', () => ({
  fetchUserUpdate: vi.fn()
}));

const updateUserMock = vi.mocked(fetchUserUpdate);
const activeUser = {
  id: 'user-1',
  openId: null,
  unionId: null,
  nickname: '小明',
  avatarUrl: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: '2026-11-15T00:00:00.000Z',
  updatedAt: '2026-11-15T00:00:00.000Z'
} satisfies ApiManagement.User;
const response = {
  data: activeUser,
  error: null,
  response: {
    data: { code: 200, data: activeUser },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() }
  }
} satisfies Awaited<ReturnType<typeof fetchUserUpdate>>;
const failedResponse = {
  data: null,
  error: new AxiosError('failed'),
  response: {
    data: { code: 500, data: activeUser },
    status: 500,
    statusText: 'Internal Server Error',
    headers: {},
    config: { headers: new AxiosHeaders() }
  }
} satisfies Awaited<ReturnType<typeof fetchUserUpdate>>;

vi.stubGlobal('window', { $message: { success: vi.fn(), warning: vi.fn() } });

beforeEach(() => {
  vi.clearAllMocks();
  updateUserMock.mockResolvedValue(response);
});

describe('useUserStatus', () => {
  it('启用或停用用户时只提交目标用户和新状态', async () => {
    const onSuccess = vi.fn();
    const { pendingId, toggle } = useUserStatus({ onSuccess });

    await toggle(activeUser);

    expect(updateUserMock).toHaveBeenCalledWith({ id: 'user-1', isActive: false });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(pendingId.value).toBe('');
    expect(window.$message?.success).toHaveBeenCalledWith('用户已停用');
  });

  it('更新失败时不刷新列表并允许再次提交', async () => {
    updateUserMock.mockResolvedValueOnce(failedResponse);
    const onSuccess = vi.fn();
    const { toggle } = useUserStatus({ onSuccess });

    await toggle(activeUser);
    await toggle(activeUser);

    expect(updateUserMock).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
