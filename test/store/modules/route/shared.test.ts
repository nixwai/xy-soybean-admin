import { describe, expect, it, vi } from 'vitest';
import type { ElegantConstRoute } from '@elegant-router/types';

vi.mock('@/locales', () => ({ $t: (key: string) => key }));
vi.mock('@/hooks/common/icon', () => ({
  useSvgIcon: () => ({ SvgIconVNode: () => undefined })
}));

import { getGlobalMenusByAuthRoutes } from '@/store/modules/route/shared';

function createRoute(name: string, path: string, order: number, children?: ElegantConstRoute[]): ElegantConstRoute {
  return {
    name,
    path,
    component: 'layout.base',
    meta: { title: `前端${name}`, order },
    ...(children ? { children } : {})
  } as ElegantConstRoute;
}

describe('getGlobalMenusByAuthRoutes', () => {
  it('根据静态路由生成全局菜单并保留父级分组', () => {
    const routes = [
      createRoute('home', '/home', 1),
      createRoute('system-management', '/system-management', 2, [
        createRoute('system-management_admin', '/system-management/admin', 1),
        createRoute('system-management_role', '/system-management/role', 2)
      ])
    ];

    const menus = getGlobalMenusByAuthRoutes(routes);

    expect(menus.map(menu => menu.label)).toEqual(['前端home', '前端system-management']);
    expect(menus[1].children?.map(menu => menu.label)).toEqual([
      '前端system-management_admin',
      '前端system-management_role'
    ]);
  });

  it('忽略隐藏路由', () => {
    const routes = [
      createRoute('home', '/home', 1),
      {
        ...createRoute('hidden', '/hidden', 2),
        meta: { title: '隐藏路由', hideInMenu: true }
      }
    ] as ElegantConstRoute[];

    expect(getGlobalMenusByAuthRoutes(routes).map(menu => menu.key)).toEqual(['home']);
  });
});
