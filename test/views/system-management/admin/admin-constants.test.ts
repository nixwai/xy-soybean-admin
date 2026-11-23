import { describe, expect, it } from 'vitest';
import {
  ADMIN_PASSWORD_PATTERN,
  ADMIN_USERNAME_PATTERN,
  createAdminForm,
  createAdminPasswordForm,
  toAdminForm
} from '@/views/system-management/admin/config/constants';

const admin = {
  id: 'admin-1',
  username: 'operator',
  isActive: true,
  isRoot: false
} as ApiManagement.Admin;

describe('管理员表单约束', () => {
  it('创建表单使用独立默认对象，避免跨弹窗共享状态', () => {
    const first = createAdminForm();
    const second = createAdminForm();
    first.username = 'changed';

    expect(second).toEqual({
      username: '',
      password: '',
      confirmPassword: '',
      isActive: true,
      isRoot: false,
      currentPassword: ''
    });
    expect(createAdminPasswordForm()).toEqual({
      password: '',
      confirmPassword: '',
      currentPassword: ''
    });
  });

  it('用户名和密码规则拒绝空格、短值和缺少数字或字母的值', () => {
    expect(ADMIN_USERNAME_PATTERN.test('operator_1')).toBe(true);
    expect(ADMIN_USERNAME_PATTERN.test('ab')).toBe(false);
    expect(ADMIN_USERNAME_PATTERN.test('operator name')).toBe(false);
    expect(ADMIN_PASSWORD_PATTERN.test('Admin1234')).toBe(true);
    expect(ADMIN_PASSWORD_PATTERN.test('abcdefgh')).toBe(false);
    expect(ADMIN_PASSWORD_PATTERN.test('12345678')).toBe(false);
  });

  it('编辑表单只复制可编辑字段并清空敏感字段', () => {
    expect(toAdminForm(admin)).toEqual({
      username: 'operator',
      password: '',
      confirmPassword: '',
      isActive: true,
      isRoot: false,
      currentPassword: ''
    });
  });
});
