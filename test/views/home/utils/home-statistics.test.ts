import { describe, expect, it } from 'vitest';
import { createHomeStatCards } from '@/views/home/utils/home-statistics';

describe('createHomeStatCards', () => {
  it('按固定顺序生成首页统计卡片', () => {
    const stats = { admins: 1, roles: 2, permissions: 3, menus: 4, audits: 5 };
    const cards = createHomeStatCards(stats, key => key);

    expect(cards).toEqual([
      { label: 'page.home.adminCount', value: 1, icon: 'carbon:user-admin' },
      { label: 'page.home.roleCount', value: 2, icon: 'carbon:identification' },
      { label: 'page.home.permissionCount', value: 3, icon: 'carbon:security' },
      { label: 'page.home.menuCount', value: 4, icon: 'carbon:menu' },
      { label: 'page.home.auditCount', value: 5, icon: 'carbon:activity' }
    ]);
  });
});
