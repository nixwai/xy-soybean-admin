import type { PermissionQueryModel } from '../typings';

/** 按权限业务字段过滤分组数据，不改变后端返回的权限记录。 */
export function filterPermissionGroups(
  groups: ApiManagement.PermissionGroup[],
  query: PermissionQueryModel
): ApiManagement.PermissionGroup[] {
  return groups
    .map(group => {
      const matchesCategory = !query.categoryFilter || group.category === query.categoryFilter;
      return {
        ...group,
        permissions: group.permissions.filter(permission => {
          const matchesField = (value: string | null | undefined, expected: string) =>
            !expected || value?.toLocaleLowerCase().includes(expected.toLocaleLowerCase()) === true;
          const matchesFields =
            matchesField(permission.code, query.code) &&
            matchesField(permission.name, query.name) &&
            matchesField(permission.description, query.description);
          const matchesStatus =
            query.statusFilter === null || permission.isActive === (query.statusFilter === 'active');
          return matchesCategory && matchesFields && matchesStatus;
        })
      };
    })
    .filter(group => group.permissions.length > 0);
}
