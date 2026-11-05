import { describe, expect, it } from 'vitest';
import type { ElegantConstRoute } from '@elegant-router/types';
import { filterAuthRoutesByPermissions, hasRouteAccess } from '@/router/routes/access';

function createRoute(
  name: string,
  meta: Record<string, unknown> = {},
  children?: ElegantConstRoute[]
): ElegantConstRoute {
  return {
    name,
    path: `/${name}`,
    component: 'layout.base',
    meta: { title: name, ...meta },
    ...(children ? { children } : {})
  } as ElegantConstRoute;
}

describe('filterAuthRoutesByPermissions', () => {
  const routes = [
    createRoute('home'),
    createRoute('system-management', {}, [
      createRoute('system-management_admin', { rootOnly: true }),
      createRoute('system-management_audit', { permission: 'system.audit.read' }),
      createRoute('system-management_role', { rootOnly: true })
    ])
  ];

  it('根管理员保留全部路由', () => {
    const result = filterAuthRoutesByPermissions(routes, [], true);

    expect(result.map(route => route.name)).toEqual(['home', 'system-management']);
    expect(result[1].children?.map(child => child.name)).toEqual([
      'system-management_admin',
      'system-management_audit',
      'system-management_role'
    ]);
  });

  it('普通管理员只保留命中权限编码的路由', () => {
    const result = filterAuthRoutesByPermissions(routes, ['system.audit.read'], false);

    expect(result.map(route => route.name)).toEqual(['home', 'system-management']);
    expect(result[1].children?.map(child => child.name)).toEqual(['system-management_audit']);
  });

  it('子路由全部被过滤时父级路由一并移除', () => {
    const result = filterAuthRoutesByPermissions(routes, [], false);

    expect(result.map(route => route.name)).toEqual(['home']);
  });
});

describe('hasRouteAccess', () => {
  it('根管理员放行全部路由', () => {
    expect(hasRouteAccess({ rootOnly: true }, true, [])).toBe(true);
  });

  it('普通管理员不能访问仅根管理员路由，且必须命中权限编码', () => {
    expect(hasRouteAccess({ rootOnly: true }, false, ['system.audit.read'])).toBe(false);
    expect(hasRouteAccess({ permission: 'system.audit.read' }, false, [])).toBe(false);
    expect(hasRouteAccess({ permission: 'system.audit.read' }, false, ['system.audit.read'])).toBe(true);
    expect(hasRouteAccess({}, false, [])).toBe(true);
  });
});
