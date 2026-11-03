import { describe, expect, it } from 'vitest';
import { createRoleForm } from '@/views/role/config/constants';

describe('role form defaults', () => {
  it('creates an active role form with no permissions', () => {
    expect(createRoleForm()).toEqual({
      code: '',
      name: '',
      description: '',
      isActive: true,
      permissionIds: []
    });
  });
});
