import { computed, ref } from 'vue';
import { bindRolePermissions, unbindRolePermissions } from '@/service/api';
import { createRolePermissionAssignForm } from '../config/constants';
import type { RolePermissionAssignModel } from '../typings';

interface RolePermissionAssignOptions {
  onSuccess: () => void | Promise<void>;
}

/** 角色权限分配，按绑定和解绑差异分别批量提交。 */
export function useRolePermissionAssign(options: RolePermissionAssignOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<ApiManagement.Role | null>(null);
  const form = ref<RolePermissionAssignModel>(createRolePermissionAssignForm());

  /** 打开弹窗时可调整权限的快照，避免用户勾选变化影响不可调整权限的计算。 */
  const manageablePermissionIds = ref<string[]>([]);

  /** 打开权限分配弹窗，仅将当前可分配目录中的权限作为可勾选初始值。 */
  function open(row: ApiManagement.Role, assignableIds: string[]) {
    const assignable = new Set(assignableIds);
    target.value = { ...row, permissionIds: [...row.permissionIds] };
    manageablePermissionIds.value = row.permissionIds.filter(id => assignable.has(id));
    form.value = { permissionIds: [...manageablePermissionIds.value] };
    showModal.value = true;
  }

  /** 将批量绑定成功的关系写回本地快照，使失败后重试只提交未完成的差异。 */
  function markPermissionsBound(permissionIds: string[]) {
    const role = target.value;
    if (!role || permissionIds.length === 0) return;
    const boundIds = new Set(role.permissionIds);
    const nextPermissionIds = [...role.permissionIds];
    for (const permissionId of permissionIds) {
      if (boundIds.has(permissionId)) continue;
      boundIds.add(permissionId);
      nextPermissionIds.push(permissionId);
    }
    target.value = { ...role, permissionIds: nextPermissionIds };
    const manageableIds = new Set(manageablePermissionIds.value);
    manageablePermissionIds.value = [
      ...manageablePermissionIds.value,
      ...permissionIds.filter(id => !manageableIds.has(id))
    ];
  }

  /** 将批量解绑成功的关系写回本地快照。 */
  function markPermissionsUnbound(permissionIds: string[]) {
    const role = target.value;
    if (!role || permissionIds.length === 0) return;
    const unboundIds = new Set(permissionIds);
    target.value = {
      ...role,
      permissionIds: role.permissionIds.filter(id => !unboundIds.has(id))
    };
  }

  /** 角色已绑定但不在可分配目录中的权限，保存时通过批量解绑清理。 */
  const unmanagedPermissionIds = computed(() => {
    if (!target.value) return [];
    const manageable = new Set(manageablePermissionIds.value);
    return target.value.permissionIds.filter(id => !manageable.has(id));
  });

  /** 计算需要新增和解除的权限绑定关系。 */
  const permissionChanges = computed(() => {
    const previous = new Set(target.value?.permissionIds ?? []);
    const next = new Set(form.value.permissionIds);

    return {
      bindPermissionIds: [...next].filter(id => !previous.has(id)),
      unbindPermissionIds: [...previous].filter(id => !next.has(id))
    };
  });

  async function submit() {
    const role = target.value;
    if (!role || submitting.value) return;

    const { bindPermissionIds, unbindPermissionIds } = permissionChanges.value;
    if (!bindPermissionIds.length && !unbindPermissionIds.length) {
      showModal.value = false;
      return;
    }

    submitting.value = true;
    try {
      if (bindPermissionIds.length) {
        const { error } = await bindRolePermissions({
          roleId: role.id,
          permissionIds: bindPermissionIds
        });
        if (error) return;
        markPermissionsBound(bindPermissionIds);
      }

      if (unbindPermissionIds.length) {
        const { error } = await unbindRolePermissions({
          roleId: role.id,
          permissionIds: unbindPermissionIds
        });
        if (error) return;
        markPermissionsUnbound(unbindPermissionIds);
      }

      showModal.value = false;
      await options.onSuccess();
      window.$message?.success('角色权限已更新');
    } finally {
      submitting.value = false;
    }
  }

  return {
    showModal,
    submitting,
    target,
    form,
    unmanagedPermissionIds,
    permissionChanges,
    open,
    submit
  };
}
