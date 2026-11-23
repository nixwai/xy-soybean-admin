import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  token: null as string | null,
  permissions: [] as string[],
  isStaticSuper: false,
  routeStore: {
    isInitConstantRoute: true,
    isInitAuthRoute: true,
    routeHome: 'home',
    initConstantRoute: vi.fn(),
    initAuthRoute: vi.fn(),
    onRouteSwitchWhenLoggedIn: vi.fn(),
    onRouteSwitchWhenNotLoggedIn: vi.fn(),
    getIsAuthRouteExist: vi.fn()
  }
}));

vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({
    userInfo: { permissions: state.permissions },
    isStaticSuper: state.isStaticSuper
  })
}));
vi.mock('@/store/modules/route', () => ({
  useRouteStore: () => state.routeStore
}));
vi.mock('@/utils/storage', () => ({
  localStg: { get: (key: string) => (key === 'token' ? state.token : null) }
}));

import { createRouteGuard } from '@/router/guard/route';

type Route = {
  name: string;
  path: string;
  fullPath: string;
  meta: { constant?: boolean; permission?: string; href?: string };
  query?: Record<string, unknown>;
  hash?: string;
  redirectedFrom?: { name?: string };
};

function registerGuard() {
  let guard!: (to: Route, from: Route) => Promise<unknown>;
  const router = {
    beforeEach(callback: typeof guard) {
      guard = callback;
    }
  };
  createRouteGuard(router as never);
  return guard;
}

const from: Route = {
  name: 'home',
  path: '/home',
  fullPath: '/home',
  meta: { constant: true }
};

describe('路由鉴权守卫', () => {
  beforeEach(() => {
    state.token = null;
    state.permissions = [];
    state.isStaticSuper = false;
    state.routeStore.isInitConstantRoute = true;
    state.routeStore.isInitAuthRoute = true;
    state.routeStore.getIsAuthRouteExist.mockResolvedValue(false);
    vi.stubGlobal('window', { open: vi.fn() });
    vi.clearAllMocks();
    state.routeStore.getIsAuthRouteExist.mockReset();
    state.routeStore.getIsAuthRouteExist.mockResolvedValue(false);
  });

  it('未登录访问受保护路由时跳转登录页并携带原始地址', async () => {
    const guard = registerGuard();
    const to: Route = {
      name: 'system-admin',
      path: '/system-management/admin',
      fullPath: '/system-management/admin?page=2',
      meta: {}
    };

    await expect(guard(to, from)).resolves.toEqual({
      name: 'login',
      query: { redirect: '/system-management/admin?page=2' }
    });
  });

  it('已登录访问登录页时回到根路由，无权限访问时进入 403', async () => {
    state.token = 'access-token';
    const guard = registerGuard();

    await expect(
      guard(
        {
          name: 'login',
          path: '/login',
          fullPath: '/login',
          meta: { constant: true }
        },
        from
      )
    ).resolves.toEqual({ name: 'root' });

    const denied: Route = {
      name: 'system-admin',
      path: '/system-management/admin',
      fullPath: '/system-management/admin',
      meta: { permission: 'system.admin.read' }
    };
    await expect(guard(denied, from)).resolves.toEqual({ name: '403' });
  });

  it('已登录且具有路由权限时放行，公开路由不要求权限', async () => {
    state.token = 'access-token';
    state.permissions = ['system.admin.read'];
    const guard = registerGuard();
    const allowed: Route = {
      name: 'system-admin',
      path: '/system-management/admin',
      fullPath: '/system-management/admin',
      meta: { permission: 'system.admin.read' }
    };
    const constant: Route = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      meta: { constant: true }
    };

    await expect(guard(allowed, from)).resolves.toBeUndefined();
    await expect(guard(constant, from)).resolves.toBeUndefined();
    expect(state.routeStore.onRouteSwitchWhenLoggedIn).toHaveBeenCalled();
  });

  it('常量路由未初始化时先初始化并返回原路径，未登录常量路由直接放行', async () => {
    state.routeStore.isInitConstantRoute = false;
    const guard = registerGuard();
    const target: Route = {
      name: 'system-admin',
      path: '/system-management/admin',
      fullPath: '/system-management/admin?tab=1',
      query: { tab: '1' },
      hash: '#top',
      meta: {}
    };

    await expect(guard(target, from)).resolves.toEqual({
      path: '/system-management/admin?tab=1',
      replace: true,
      query: { tab: '1' },
      hash: '#top'
    });
    expect(state.routeStore.initConstantRoute).toHaveBeenCalledOnce();

    state.routeStore.isInitConstantRoute = true;
    const constant: Route = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      meta: { constant: true }
    };
    await expect(guard(constant, from)).resolves.toBeUndefined();
    expect(state.routeStore.onRouteSwitchWhenNotLoggedIn).toHaveBeenCalled();
  });

  it('登录后初始化权限路由，并将已存在的未找到路径导向 403', async () => {
    state.token = 'access-token';
    state.routeStore.isInitAuthRoute = false;
    const guard = registerGuard();
    const target: Route = {
      name: 'not-found',
      path: '/:pathMatch(.*)*',
      fullPath: '/system-management/admin',
      meta: {},
      redirectedFrom: { name: 'root' }
    };
    state.routeStore.getIsAuthRouteExist.mockResolvedValueOnce(true);

    await expect(guard(target, from)).resolves.toEqual({
      path: '/',
      replace: true,
      query: undefined,
      hash: undefined
    });
    expect(state.routeStore.initAuthRoute).toHaveBeenCalledOnce();

    state.routeStore.isInitAuthRoute = true;
    state.routeStore.getIsAuthRouteExist.mockResolvedValueOnce(true);
    await expect(guard({ ...target, redirectedFrom: undefined }, from)).resolves.toEqual({ name: '403' });
  });

  it('未找到不存在的路径时放行，带 href 的路由打开新窗口并返回原路由', async () => {
    state.token = 'access-token';
    const guard = registerGuard();
    const notFound: Route = {
      name: 'not-found',
      path: '/:pathMatch(.*)*',
      fullPath: '/unknown',
      meta: {}
    };
    state.routeStore.getIsAuthRouteExist.mockResolvedValue(false);
    await expect(guard(notFound, from)).resolves.toBeUndefined();

    const external: Route = {
      name: 'external',
      path: '/external',
      fullPath: '/external',
      meta: { constant: true, href: 'https://example.com' }
    };
    await expect(guard(external, from)).resolves.toEqual({
      path: '/home',
      replace: true,
      query: undefined,
      hash: undefined
    });
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });
});
