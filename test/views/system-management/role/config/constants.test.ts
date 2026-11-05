import { describe, expect, it } from 'vitest';
import {
  createRoleForm,
  createRolePermissionAssignForm,
  toRoleForm
} from '@/views/system-management/role/config/constants';

describe('role form defaults', () => {
  it('创建启用状态且不含权限绑定的角色表单', () => {
    expect(createRoleForm()).toEqual({ code: '', name: '', description: '', isActive: true });
    expect(createRolePermissionAssignForm()).toEqual({ permissionIds: [] });
  });

  it('将空描述归一化为空字符串以便表单编辑', () => {
    expect(
      toRoleForm({
        id: '1',
        code: 'operator',
        name: '普通管理员',
        description: null,
        isActive: true,
        isSystem: true,
        isProtected: true,
        permissionIds: ['9'],
        deletedAt: null
      })
    ).toEqual({ code: 'operator', name: '普通管理员', description: '', isActive: true });
  });
});
