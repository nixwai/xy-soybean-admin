import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchAdminCreate: vi.fn(),
  fetchAdminUpdate: vi.fn(),
  fetchAdminSoftDelete: vi.fn(),
  fetchRoleCreate: vi.fn(),
  fetchRoleUpdate: vi.fn(),
  encryptPassword: vi.fn(async (value: string) => `encrypted:${value}`),
  success: vi.fn(),
  warning: vi.fn()
}));

vi.mock('@/service/api', () => ({
  fetchAdminCreate: mocks.fetchAdminCreate,
  fetchAdminUpdate: mocks.fetchAdminUpdate,
  fetchAdminSoftDelete: mocks.fetchAdminSoftDelete,
  fetchRoleCreate: mocks.fetchRoleCreate,
  fetchRoleUpdate: mocks.fetchRoleUpdate
}));
vi.mock('@/utils/security', () => ({ encryptPassword: mocks.encryptPassword }));

import { useAdminDelete } from '@/views/system-management/admin/hooks/use-admin-delete';
import { useAdminFormSubmit } from '@/views/system-management/admin/hooks/use-admin-form-submit';
import { useRoleFormSubmit } from '@/views/system-management/role/hooks/use-role-form-submit';
import { useRoleStatus } from '@/views/system-management/role/hooks/use-role-status';

const admin = {
  id: 'admin-1',
  username: 'operator',
  isActive: true,
  isRoot: false
} as ApiManagement.Admin;
const rootAdmin = {
  ...admin,
  id: 'root-1',
  username: 'root',
  isRoot: true
} as ApiManagement.Admin;
const role = {
  id: 'role-1',
  code: 'operator',
  name: '操作员',
  description: null,
  isActive: true,
  isSystem: false,
  isProtected: false,
  permissionIds: [],
  deletedAt: null
} as ApiManagement.Role;
const response = { data: null, error: null, response: null } as never;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchAdminCreate.mockResolvedValue(response);
  mocks.fetchAdminUpdate.mockResolvedValue(response);
  mocks.fetchAdminSoftDelete.mockResolvedValue(response);
  mocks.fetchRoleCreate.mockResolvedValue(response);
  mocks.fetchRoleUpdate.mockResolvedValue(response);
  window.$message = { success: mocks.success, warning: mocks.warning } as never;
});

describe('管理员表单和删除流程', () => {
  it('创建管理员时加密密码和当前密码，并在成功后关闭弹窗刷新', async () => {
    const onSuccess = vi.fn();
    const hook = useAdminFormSubmit({ onSuccess });
    hook.openCreate();
    hook.form.value.username = 'operator';
    hook.form.value.password = 'Admin1234';
    hook.form.value.currentPassword = 'Root1234';
    hook.form.value.isRoot = true;

    expect(hook.needCurrentPassword.value).toBe(true);
    await hook.submit();

    expect(mocks.fetchAdminCreate).toHaveBeenCalledWith({
      username: 'operator',
      password: 'encrypted:Admin1234',
      isRoot: true,
      currentPassword: 'encrypted:Root1234'
    });
    expect(hook.showModal.value).toBe(false);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('编辑管理员时只提交允许修改字段，请求失败保留弹窗', async () => {
    mocks.fetchAdminUpdate.mockResolvedValueOnce({
      data: null,
      error: new Error('failed'),
      response: null
    } as never);
    const hook = useAdminFormSubmit({ onSuccess: vi.fn() });
    hook.openEdit(rootAdmin);
    hook.form.value.username = 'root-renamed';
    await hook.submit();

    expect(mocks.fetchAdminUpdate).toHaveBeenCalledWith({
      id: 'root-1',
      username: 'root-renamed',
      isActive: true,
      isRoot: true
    });
    expect(hook.showModal.value).toBe(true);
  });

  it('删除管理员前加密复核密码，失败可重试', async () => {
    const onSuccess = vi.fn();
    const hook = useAdminDelete({ onSuccess });
    hook.open(admin);
    hook.form.value.currentPassword = 'Root1234';
    await hook.submit();

    expect(mocks.fetchAdminSoftDelete).toHaveBeenCalledWith({
      id: 'admin-1',
      currentPassword: 'encrypted:Root1234'
    });
    expect(hook.showModal.value).toBe(false);
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});

describe('角色表单和状态流程', () => {
  it('创建角色时清理空描述，编辑时不提交角色编码', async () => {
    const create = useRoleFormSubmit({ onSuccess: vi.fn() });
    create.openCreate();
    create.form.value.code = 'operator';
    create.form.value.name = '操作员';
    create.form.value.description = '  描述  ';
    await create.submit();
    expect(mocks.fetchRoleCreate).toHaveBeenCalledWith({
      code: 'operator',
      name: '操作员',
      description: '描述'
    });

    const update = useRoleFormSubmit({ onSuccess: vi.fn() });
    update.openEdit(role);
    update.form.value.name = '新名称';
    update.form.value.description = '   ';
    await update.submit();
    expect(mocks.fetchRoleUpdate).toHaveBeenCalledWith({
      id: 'role-1',
      name: '新名称',
      description: null,
      isActive: true
    });
  });

  it('受保护角色不能切换状态，普通角色成功后刷新', async () => {
    const onSuccess = vi.fn();
    const hook = useRoleStatus({ onSuccess });
    await hook.toggle({ ...role, isProtected: true });
    expect(mocks.fetchRoleUpdate).not.toHaveBeenCalled();
    expect(mocks.warning).toHaveBeenCalledWith('受保护角色不允许停用');

    await hook.toggle(role);
    expect(mocks.fetchRoleUpdate).toHaveBeenCalledWith({
      id: 'role-1',
      isActive: false
    });
    expect(mocks.success).toHaveBeenCalledWith('角色已停用');
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(hook.pendingId.value).toBe('');
  });
});
