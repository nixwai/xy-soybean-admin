import { describe, expect, it } from 'vitest';
import { createHomeStatCards, formatAuditCount } from '@/views/home/utils/home-statistics';

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

  it('跳过当前管理员无权访问的指标而不是展示为 0', () => {
    const cards = createHomeStatCards(
      { admins: null, roles: null, permissions: null, menus: null, audits: '12+' },
      key => key
    );

    expect(cards).toEqual([{ label: 'page.home.auditCount', value: '12+', icon: 'carbon:activity' }]);
  });
});

describe('formatAuditCount', () => {
  it('还有下一页时用加号标记为下界', () => {
    expect(formatAuditCount({ items: [{ id: '1' }] as never, nextCursor: 'cursor', hasMore: true })).toBe('1+');
  });

  it('没有下一页时返回精确条数，空数据返回 null', () => {
    expect(formatAuditCount({ items: [], nextCursor: null, hasMore: false })).toBe(0);
    expect(formatAuditCount(null)).toBeNull();
  });
});
