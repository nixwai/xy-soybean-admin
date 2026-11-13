import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bindRolePermission, unbindRolePermission } from '@/service/api';
import { useRolePermissionAssign } from '@/views/system-management/role/hooks/use-role-permission-assign';

vi.mock('@/service/api', () => ({
  bindRolePermission: vi.fn(),
  unbindRolePermission: vi.fn()
}));

const bindMock = vi.mocked(bindRolePermission);
const unbindMock = vi.mocked(unbindRolePermission);
const response = { data: null, error: null, response: null } as never;
vi.stubGlobal('window', { $message: { success: vi.fn() } });
const role = {
  id: 'role-1',
  code: 'operator',
  name: '操作员',
  description: null,
  isActive: true,
  isSystem: false,
  isProtected: false,
  permissionIds: ['permission-old', 'permission-keep'],
  deletedAt: null
} as ApiManagement.Role;

describe('useRolePermissionAssign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bindMock.mockResolvedValue(response);
    unbindMock.mockResolvedValue(response);
  });

  it('只提交可管理权限的绑定差异', async () => {
    const onSuccess = vi.fn();
    const { form, open, submit, unmanagedPermissionIds } = useRolePermissionAssign({ onSuccess });

    open(role, ['permission-keep', 'permission-new']);
    form.value.permissionIds = ['permission-keep', 'permission-new'];
    await submit();

    expect(bindMock).toHaveBeenCalledWith({ roleId: 'role-1', permissionId: 'permission-new' });
    expect(unbindMock).toHaveBeenCalledWith({ roleId: 'role-1', permissionId: 'permission-old' });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('没有权限变化时直接关闭而不发请求', async () => {
    const { open, submit, showModal } = useRolePermissionAssign({ onSuccess: vi.fn() });

    open(role, ['permission-old', 'permission-keep']);
    await submit();

    expect(bindMock).not.toHaveBeenCalled();
    expect(unbindMock).not.toHaveBeenCalled();
    expect(showModal.value).toBe(false);
  });

  it('权限绑定部分失败时保留弹窗，重试只提交未完成的差异', async () => {
    unbindMock.mockResolvedValueOnce({ data: null, error: new Error('failed'), response: null } as never);
    const onSuccess = vi.fn();
    const { form, open, submit, showModal, submitting } = useRolePermissionAssign({ onSuccess });

    open(role, ['permission-keep', 'permission-new']);
    form.value.permissionIds = ['permission-keep', 'permission-new'];
    await submit();

    expect(showModal.value).toBe(true);
    expect(submitting.value).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();

    await submit();

    expect(bindMock).toHaveBeenCalledOnce();
    expect(unbindMock).toHaveBeenCalledTimes(2);
    expect(showModal.value).toBe(false);
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
