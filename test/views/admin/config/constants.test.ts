import { describe, expect, it } from 'vitest';
import { createAdminForm, createAdminPasswordForm } from '@/views/admin/config/constants';

describe('admin form defaults', () => {
  it('creates independent empty forms', () => {
    const first = createAdminForm();
    const second = createAdminForm();
    first.roleIds.push('role-1');

    expect(second.roleIds).toEqual([]);
    expect(createAdminPasswordForm()).toEqual({ password: '', currentPassword: '' });
  });
});
