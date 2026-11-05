import { describe, expect, it } from 'vitest';
import {
  createAdminDeleteForm,
  createAdminForm,
  createAdminPasswordForm,
  createAdminRoleAssignForm,
  toAdminForm
} from '@/views/system-management/admin/config/constants';

describe('admin form defaults', () => {
  it('创建彼此独立的空表单', () => {
    const first = createAdminForm();
    const second = createAdminForm();
    first.username = 'operator01';

    expect(second.username).toBe('');
    expect(createAdminPasswordForm()).toEqual({ password: '', confirmPassword: '', currentPassword: '' });
    expect(createAdminRoleAssignForm()).toEqual({ roleIds: [] });
    expect(createAdminDeleteForm()).toEqual({ currentPassword: '' });
  });

  it('编辑态保留身份和状态，密码字段始终留空', () => {
    expect(
      toAdminForm({
        id: '1',
        username: 'admin',
        isActive: true,
        isRoot: true,
        roleIds: ['2'],
        createdAt: '2026-11-04T00:00:00.000Z',
        updatedAt: '2026-11-04T00:00:00.000Z'
      })
    ).toEqual({
      username: 'admin',
      password: '',
      confirmPassword: '',
      isActive: true,
      isRoot: true,
      currentPassword: ''
    });
  });
});
