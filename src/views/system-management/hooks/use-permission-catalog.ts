import { computed, ref } from 'vue';
import { fetchAssignablePermissionList, fetchPermissionList } from '@/service/api';

/** 分组权限目录数据源，供角色授权、权限管理和菜单权限编码选择复用。 */
export function usePermissionCatalog() {
  const permissionLoading = ref(false);
  const permissionGroups = ref<ApiManagement.PermissionGroup[]>([]);
  const permissionTotal = ref(0);

  /** 拉取分组权限目录，assignable 为真时只返回可绑定给普通角色的权限。 */
  async function loadPermissionCatalog(assignable = false) {
    permissionLoading.value = true;
    try {
      const { data, error } = await (assignable ? fetchAssignablePermissionList() : fetchPermissionList());
      if (!error && data) {
        permissionGroups.value = data.groups;
        permissionTotal.value = data.total;
      }
    } finally {
      permissionLoading.value = false;
    }
  }

  /** 铺平后的权限记录列表。 */
  const permissions = computed(() => permissionGroups.value.flatMap(group => group.permissions));

  /** 权限编码到权限记录的映射。 */
  const permissionByCode = computed(() => new Map(permissions.value.map(item => [item.code, item])));

  return {
    permissionLoading,
    permissionGroups,
    permissionTotal,
    permissions,
    permissionByCode,
    loadPermissionCatalog
  };
}
