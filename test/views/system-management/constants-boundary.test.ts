import { describe, expect, it } from 'vitest';
import {
  ADMIN_PAGE_SIZE,
  createAdminDeleteForm,
  createAdminPasswordForm,
  createAdminRoleAssignForm
} from '@/views/system-management/admin/config/constants';
import {
  ROLE_CODE_PATTERN,
  ROLE_FORM_RULES,
  ROLE_PAGE_SIZE,
  createRoleForm,
  createRolePermissionAssignForm,
  toRoleForm
} from '@/views/system-management/role/config/constants';

describe('管理员和角色配置契约', () => {
  it('暴露稳定分页大小并创建全部独立表单模型', () => {
    expect(ADMIN_PAGE_SIZE).toBe(20);
    expect(ROLE_PAGE_SIZE).toBe(20);
    expect(createAdminRoleAssignForm()).toEqual({ roleIds: [] });
    expect(createAdminDeleteForm()).toEqual({ currentPassword: '' });
    expect(createAdminPasswordForm()).toEqual({
      password: '',
      confirmPassword: '',
      currentPassword: ''
    });
    expect(createRoleForm()).toEqual({
      code: '',
      name: '',
      description: '',
      isActive: true
    });
    expect(createRolePermissionAssignForm()).toEqual({ permissionIds: [] });
  });

  it('角色编码只接受规定的小写格式，表单规则包含长度边界', () => {
    expect(ROLE_CODE_PATTERN.test('operator:asset-read')).toBe(true);
    expect(ROLE_CODE_PATTERN.test('Operator')).toBe(false);
    expect(ROLE_CODE_PATTERN.test('1operator')).toBe(false);
    expect(ROLE_FORM_RULES.code).toEqual(
      expect.arrayContaining([expect.objectContaining({ required: true }), expect.objectContaining({ max: 64 })])
    );
    expect(ROLE_FORM_RULES.name).toEqual(expect.arrayContaining([expect.objectContaining({ max: 128 })]));
    expect(ROLE_FORM_RULES.description).toEqual([expect.objectContaining({ max: 255 })]);
  });

  it('编辑角色时将空描述归一化为空字符串', () => {
    const role = {
      id: 'role-1',
      code: 'operator',
      name: '操作员',
      description: null,
      isActive: false,
      isSystem: false,
      isProtected: false,
      permissionIds: [],
      deletedAt: null
    } as ApiManagement.Role;
    expect(toRoleForm(role)).toEqual({
      code: 'operator',
      name: '操作员',
      description: '',
      isActive: false
    });
  });
});
