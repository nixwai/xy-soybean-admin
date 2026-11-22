import { request } from '../request';

/** get user routes */
export function fetchRouteGetUserRoutes() {
  return request<Api.Route.UserRoute>({ url: '/route/getUserRoutes' });
}
