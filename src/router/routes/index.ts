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
    admin: 'admin:GET',
    audit: 'audit:GET',
    menu: 'menu:GET',
    permission: 'permission:GET',
    role: 'role:GET'
  };

  [...customRoutes, ...generatedRoutes].forEach(item => {
    const permission = permissionMap[item.name];
    const route = (permission ? { ...item, meta: { ...item.meta, permission } } : item) as ElegantRoute;
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
