import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encryptPassword } from '@/utils/security';
import { bindAdminRole, resetAdminPassword, softDeleteAdmin, unbindAdminRole } from '@/service/api';
import { useAdminDelete } from '@/views/system-management/admin/hooks/use-admin-delete';
import { useAdminPasswordReset } from '@/views/system-management/admin/hooks/use-admin-password-reset';
import { useAdminRoleAssign } from '@/views/system-management/admin/hooks/use-admin-role-assign';

vi.mock('@/service/api', () => ({
  bindAdminRole: vi.fn(),
  resetAdminPassword: vi.fn(),
  softDeleteAdmin: vi.fn(),
  unbindAdminRole: vi.fn()
}));

vi.mock('@/utils/security', () => ({
  encryptPassword: vi.fn(async (value: string) => `encrypted:${value}`)
}));

const bindRoleMock = vi.mocked(bindAdminRole);
const resetPasswordMock = vi.mocked(resetAdminPassword);
const deleteMock = vi.mocked(softDeleteAdmin);
const unbindRoleMock = vi.mocked(unbindAdminRole);
const successMock = vi.fn();

vi.stubGlobal('window', { $message: { success: successMock } });

const admin = {
  id: 'admin-1',
  username: 'operator',
  isActive: true,
  isRoot: false,
  roleIds: ['role-old']
} as ApiManagement.Admin;

const response = { data: null, error: null, response: null } as never;

describe('admin mutation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bindRoleMock.mockResolvedValue(response);
    unbindRoleMock.mockResolvedValue(response);
    resetPasswordMock.mockResolvedValue(response);
    deleteMock.mockResolvedValue(response);
  });

  it('按角色差异依次提交绑定和解绑，并在成功后刷新', async () => {
    const onSuccess = vi.fn();
    const { form, open, submit, showModal } = useAdminRoleAssign({ onSuccess });

    open(admin);
    form.value.roleIds = ['role-new'];
    await submit();

    expect(bindRoleMock).toHaveBeenCalledWith({ adminId: 'admin-1', roleId: 'role-new' });
    expect(unbindRoleMock).toHaveBeenCalledWith({ adminId: 'admin-1', roleId: 'role-old' });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(showModal.value).toBe(false);
  });

  it('提交进行中时忽略重复提交', async () => {
    let resolveBind!: (value: unknown) => void;
    bindRoleMock.mockReturnValueOnce(
      new Promise(resolve => {
        resolveBind = resolve;
      }) as never
    );

    const { form, open, submit } = useAdminRoleAssign({ onSuccess: vi.fn() });
    open(admin);
    form.value.roleIds = ['role-new'];

    const first = submit();
    await Promise.resolve();
    await submit();

    expect(bindRoleMock).toHaveBeenCalledOnce();
    resolveBind(response);
    await first;
  });

  it('角色绑定部分失败时保留弹窗，重试只提交未完成的差异', async () => {
    unbindRoleMock.mockResolvedValueOnce({ data: null, error: new Error('failed'), response: null } as never);
    const onSuccess = vi.fn();
    const { form, open, submit, showModal, submitting } = useAdminRoleAssign({ onSuccess });

    open(admin);
    form.value.roleIds = ['role-new'];
    await submit();

    expect(showModal.value).toBe(true);
    expect(submitting.value).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();

    await submit();

    expect(bindRoleMock).toHaveBeenCalledOnce();
    expect(unbindRoleMock).toHaveBeenCalledTimes(2);
    expect(showModal.value).toBe(false);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('密码重置成功时只提交加密后的密码', async () => {
    const onSuccess = vi.fn();
    const { form, open, submit } = useAdminPasswordReset({ onSuccess });

    open(admin);
    form.value.password = 'NewPassword1';
    form.value.currentPassword = 'CurrentPassword1';
    await submit();

    expect(encryptPassword).toHaveBeenCalledWith('NewPassword1');
    expect(encryptPassword).toHaveBeenCalledWith('CurrentPassword1');
    expect(resetPasswordMock).toHaveBeenCalledWith({
      id: 'admin-1',
      password: 'encrypted:NewPassword1',
      currentPassword: 'encrypted:CurrentPassword1'
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('删除请求失败时保留弹窗并允许重试', async () => {
    deleteMock.mockResolvedValueOnce({ data: null, error: new Error('failed'), response: null } as never);
    const { form, open, submit, showModal } = useAdminDelete({ onSuccess: vi.fn() });

    open(admin);
    form.value.currentPassword = 'CurrentPassword1';
    await submit();
    expect(showModal.value).toBe(true);

    await submit();
    expect(deleteMock).toHaveBeenCalledTimes(2);
  });
});
