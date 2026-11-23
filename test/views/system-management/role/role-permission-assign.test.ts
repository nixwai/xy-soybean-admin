import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRolePermissionBind, fetchRolePermissionUnbind } from '@/service/api';
import { useRolePermissionAssign } from '@/views/system-management/role/hooks/use-role-permission-assign';

vi.mock('@/service/api', () => ({
  fetchRolePermissionBind: vi.fn(),
  fetchRolePermissionUnbind: vi.fn()
}));

const bindMock = vi.mocked(fetchRolePermissionBind);
const unbindMock = vi.mocked(fetchRolePermissionUnbind);
const ok = { data: null, error: null, response: null } as never;
const role = {
  id: 'role-1',
  code: 'operator',
  name: '操作员',
  description: null,
  isActive: true,
  isSystem: false,
  isProtected: false,
  permissionIds: ['protected', 'old', 'keep'],
  deletedAt: null
} as ApiManagement.Role;

describe('角色权限分配流程', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bindMock.mockResolvedValue(ok);
    unbindMock.mockResolvedValue(ok);
  });

  it('只提交可管理权限的绑定和解绑差异', async () => {
    const onSuccess = vi.fn();
    const { form, open, permissionChanges, submit } = useRolePermissionAssign({
      onSuccess
    });
    open(role, ['keep', 'new', 'next']);
    form.value.permissionIds = ['keep', 'new', 'next'];

    expect(permissionChanges.value).toEqual({
      bindPermissionIds: ['new', 'next'],
      unbindPermissionIds: ['protected', 'old']
    });
    await submit();

    expect(bindMock).toHaveBeenCalledWith({
      roleId: 'role-1',
      permissionIds: ['new', 'next']
    });
    expect(unbindMock).toHaveBeenCalledWith({
      roleId: 'role-1',
      permissionIds: ['protected', 'old']
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('没有变化时关闭弹窗且不请求接口', async () => {
    const { open, showModal, submit } = useRolePermissionAssign({
      onSuccess: vi.fn()
    });
    open(role, ['protected', 'old', 'keep']);

    await submit();

    expect(bindMock).not.toHaveBeenCalled();
    expect(unbindMock).not.toHaveBeenCalled();
    expect(showModal.value).toBe(false);
  });

  it('解绑失败时保留弹窗，重试时只重复未完成的解绑', async () => {
    unbindMock.mockResolvedValueOnce({
      data: null,
      error: new Error('failed'),
      response: null
    } as never);
    const { form, open, showModal, submit } = useRolePermissionAssign({
      onSuccess: vi.fn()
    });
    open(role, ['keep', 'new']);
    form.value.permissionIds = ['keep', 'new'];

    await submit();
    expect(showModal.value).toBe(true);
    expect(unbindMock).toHaveBeenCalledTimes(1);

    await submit();
    expect(bindMock).toHaveBeenCalledOnce();
    expect(unbindMock).toHaveBeenCalledTimes(2);
    expect(showModal.value).toBe(false);
  });
});
