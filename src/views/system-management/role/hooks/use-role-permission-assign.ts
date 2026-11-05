import { computed, ref } from 'vue';
import { bindRolePermission, unbindRolePermission } from '@/service/api';
import { createRolePermissionAssignForm } from '../config/constants';
import type { RolePermissionAssignModel } from '../typings';

interface RolePermissionAssignOptions {
  onSuccess: () => void | Promise<void>;
}

/** 角色权限分配，后端只提供单个权限的绑定和解绑接口，这里按差异逐个提交。 */
export function useRolePermissionAssign(options: RolePermissionAssignOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<ApiManagement.Role | null>(null);
  const form = ref<RolePermissionAssignModel>(createRolePermissionAssignForm());

  /** 打开弹窗时可调整权限的快照，避免用户勾选变化影响不可调整权限的计算。 */
  const manageablePermissionIds = ref<string[]>([]);

  /** 打开权限分配弹窗，仅保留仍出现在可分配目录中的权限作为初始值。 */
  function open(row: ApiManagement.Role, assignableIds: string[]) {
    const assignable = new Set(assignableIds);
    target.value = row;
    manageablePermissionIds.value = row.permissionIds.filter(id => assignable.has(id));
    form.value = { permissionIds: [...manageablePermissionIds.value] };
    showModal.value = true;
  }

  /** 角色已绑定但不在可分配目录中的权限，无法在此界面调整。 */
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
      // 顺序提交并在首个失败处停止，避免部分成功后继续产生无效请求
      let failed = false;
      for (const permissionId of bindPermissionIds) {
        const { error } = await bindRolePermission({ roleId: role.id, permissionId });
        if (error) {
          failed = true;
          break;
        }
      }

      if (!failed) {
        for (const permissionId of unbindPermissionIds) {
          const { error } = await unbindRolePermission({ roleId: role.id, permissionId });
          if (error) {
            failed = true;
            break;
          }
        }
      }

      showModal.value = false;
      await options.onSuccess();
      if (!failed) {
        window.$message?.success('角色权限已更新');
      }
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, target, form, unmanagedPermissionIds, permissionChanges, open, submit };
}
