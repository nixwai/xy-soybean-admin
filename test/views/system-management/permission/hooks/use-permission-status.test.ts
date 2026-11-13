import { beforeEach, describe, expect, it, vi } from 'vitest';
import { disablePermission, enablePermission } from '@/service/api';
import { usePermissionStatus } from '@/views/system-management/permission/hooks/use-permission-status';

vi.mock('@/service/api', () => ({
  disablePermission: vi.fn(),
  enablePermission: vi.fn()
}));

const disableMock = vi.mocked(disablePermission);
const enableMock = vi.mocked(enablePermission);
const response = { data: null, error: null, response: null } as never;
vi.stubGlobal('window', { $message: { success: vi.fn() } });
const activePermission = { id: 'permission-1', isActive: true } as ApiManagement.Permission;
const inactivePermission = { id: 'permission-2', isActive: false } as ApiManagement.Permission;

describe('usePermissionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disableMock.mockResolvedValue(response);
    enableMock.mockResolvedValue(response);
  });

  it('根据当前状态调用启用或停用接口并刷新', async () => {
    const onSuccess = vi.fn();
    const { toggle, pendingId } = usePermissionStatus({ onSuccess });

    await toggle(activePermission);
    await toggle(inactivePermission);

    expect(disableMock).toHaveBeenCalledWith({ id: 'permission-1' });
    expect(enableMock).toHaveBeenCalledWith({ id: 'permission-2' });
    expect(onSuccess).toHaveBeenCalledTimes(2);
    expect(pendingId.value).toBe('');
  });

  it('请求失败时清理进行中状态且不触发刷新', async () => {
    disableMock.mockResolvedValueOnce({ data: null, error: new Error('failed'), response: null } as never);
    const onSuccess = vi.fn();
    const { toggle, pendingId } = usePermissionStatus({ onSuccess });

    await toggle(activePermission);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(pendingId.value).toBe('');
  });
});
