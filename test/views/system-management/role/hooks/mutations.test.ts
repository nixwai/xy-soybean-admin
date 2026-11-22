import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRolePermissionBind, fetchRolePermissionUnbind } from '@/service/api';
import { useRolePermissionAssign } from '@/views/system-management/role/hooks/use-role-permission-assign';

vi.mock('@/service/api', () => ({
  fetchRolePermissionBind: vi.fn(),
  fetchRolePermissionUnbind: vi.fn()
}));

const bindMock = vi.mocked(fetchRolePermissionBind);
const unbindMock = vi.mocked(fetchRolePermissionUnbind);
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
  permissionIds: ['permission-invalid', 'permission-old', 'permission-keep'],
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
    const { form, open, submit } = useRolePermissionAssign({ onSuccess });

    open(role, ['permission-keep', 'permission-new', 'permission-next']);
    form.value.permissionIds = ['permission-keep', 'permission-new', 'permission-next'];
    await submit();

    expect(bindMock).toHaveBeenCalledWith({
      roleId: 'role-1',
      permissionIds: ['permission-new', 'permission-next']
    });
    expect(unbindMock).toHaveBeenCalledWith({
      roleId: 'role-1',
      permissionIds: ['permission-invalid', 'permission-old']
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('没有权限变化时直接关闭而不发请求', async () => {
    const { open, submit, showModal } = useRolePermissionAssign({
      onSuccess: vi.fn()
    });

    open(role, ['permission-invalid', 'permission-old', 'permission-keep']);
    await submit();

    expect(bindMock).not.toHaveBeenCalled();
    expect(unbindMock).not.toHaveBeenCalled();
    expect(showModal.value).toBe(false);
  });

  it('权限绑定部分失败时保留弹窗，重试只提交未完成的差异', async () => {
    unbindMock.mockResolvedValueOnce({
      data: null,
      error: new Error('failed'),
      response: null
    } as never);
    const onSuccess = vi.fn();
    const { form, open, submit, showModal, submitting } = useRolePermissionAssign({ onSuccess });

    open(role, ['permission-keep', 'permission-new', 'permission-next']);
    form.value.permissionIds = ['permission-keep', 'permission-new', 'permission-next'];
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

  it('提交期间阻止重复提交', async () => {
    let resolveBind!: (value: typeof response) => void;
    const pendingBind = new Promise<typeof response>(resolve => {
      resolveBind = resolve;
    });
    bindMock.mockReturnValueOnce(pendingBind as never);
    const onSuccess = vi.fn();
    const { form, open, submit, submitting } = useRolePermissionAssign({ onSuccess });

    open(role, ['permission-keep', 'permission-new']);
    form.value.permissionIds = ['permission-keep', 'permission-new'];
    const firstSubmit = submit();

    expect(submitting.value).toBe(true);
    await submit();
    expect(bindMock).toHaveBeenCalledOnce();
    expect(unbindMock).not.toHaveBeenCalled();

    resolveBind(response);
    await firstSubmit;

    expect(unbindMock).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(submitting.value).toBe(false);
  });
});
