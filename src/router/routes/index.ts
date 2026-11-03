import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { layouts, views } from '../elegant/imports';
import { generatedRoutes } from '../elegant/routes';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: CustomRoute[] = [];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  const permissionMap: Record<string, string> = {
    'system-management_admin': 'admin:GET',
    'system-management_role': 'role:GET',
    'system-management_permission': 'permission:GET',
    'system-management_menu': 'menu:GET',
    'system-management_audit': 'audit:GET'
  };

  function applyRoutePermission(route: ElegantRoute): ElegantRoute {
    const permission = permissionMap[route.name];
    const children =
      'children' in route ? route.children?.map(child => applyRoutePermission(child as ElegantRoute)) : undefined;

    return {
      ...route,
      ...(children ? { children } : {}),
      ...(permission ? { meta: { ...route.meta, permission } } : {})
    } as ElegantRoute;
  }

  [...customRoutes, ...generatedRoutes].forEach(item => {
    const route = applyRoutePermission(item as ElegantRoute);
    if (route.meta?.constant) {
      constantRoutes.push(route);
    } else {
      authRoutes.push(route);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
