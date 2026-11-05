import type { ElegantConstRoute, ElegantRoute, RouteKey } from '@elegant-router/types';
import { PERMISSION_CODE } from '@/constants/permission';

/** 路由准入声明，与后端接口的 RootOnly 守卫和动态权限编码一一对应。 */
export interface RouteAccess {
  /** 是否仅根管理员可访问。 */
  rootOnly?: boolean;
  /** 访问所需的后端权限编码。 */
  permission?: string;
}

/** 路由元信息中参与准入判断的字段，与 RouteMeta 的可空声明保持一致。 */
interface RouteAccessMeta {
  rootOnly?: boolean | null;
  permission?: string;
}

/** 系统管理各页面在后端的准入规则。 */
export const routeAccessMap: Partial<Record<RouteKey, RouteAccess>> = {
  'system-management_admin': { rootOnly: true },
  'system-management_role': { rootOnly: true },
  'system-management_permission': { rootOnly: true },
  'system-management_menu': { rootOnly: true },
  'system-management_audit': { permission: PERMISSION_CODE.AUDIT_READ }
};

/** 为静态路由补充后端准入声明，供路由过滤和路由守卫共用。 */
export function applyRouteAccess(route: ElegantRoute): ElegantRoute {
  const access = routeAccessMap[route.name as RouteKey];
  const children =
    'children' in route ? route.children?.map(child => applyRouteAccess(child as ElegantRoute)) : undefined;

  return {
    ...route,
    ...(children ? { children } : {}),
    ...(access ? { meta: { ...route.meta, ...access } } : {})
  } as ElegantRoute;
}

/**
 * 判断路由声明的准入条件是否被当前管理员满足。
 *
 * 根管理员拥有系统全部权限直接放行；普通管理员不能访问仅根管理员路由，且必须命中声明的权限编码。
 */
export function hasRouteAccess(meta: RouteAccessMeta | undefined, isRoot: boolean, permissions: string[]) {
  if (isRoot) {
    return true;
  }

  if (meta?.rootOnly) {
    return false;
  }

  return !meta?.permission || permissions.includes(meta.permission);
}

/** 按后端根管理员身份和动态权限编码过滤静态管理路由。 */
export function filterAuthRoutesByPermissions(routes: ElegantConstRoute[], permissions: string[], isRoot: boolean) {
  return routes.flatMap(route => filterAuthRouteByPermissions(route, permissions, isRoot));
}

function filterAuthRouteByPermissions(
  route: ElegantConstRoute,
  permissions: string[],
  isRoot: boolean
): ElegantConstRoute[] {
  if (!hasRouteAccess(route.meta, isRoot, permissions)) {
    return [];
  }

  const children = route.children?.flatMap(item => filterAuthRouteByPermissions(item, permissions, isRoot));

  // 父级路由的子路由被全部过滤后，父级路由也不再保留
  if (route.children?.length && !children?.length) {
    return [];
  }

  return [{ ...route, ...(route.children ? { children } : {}) }];
}
