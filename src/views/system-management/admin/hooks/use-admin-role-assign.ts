import { computed, ref } from 'vue';
import { bindAdminRole, unbindAdminRole } from '@/service/api';
import type { AdminRoleAssignModel } from '../typings';

interface AdminRoleAssignOptions {
  onSuccess: () => void | Promise<void>;
}

/** 管理员角色绑定，后端只提供单个角色的绑定和解绑接口，这里按差异逐个提交。 */
export function useAdminRoleAssign(options: AdminRoleAssignOptions) {
  const showModal = ref(false);
  const submitting = ref(false);
  const target = ref<ApiManagement.Admin | null>(null);
  const form = ref<AdminRoleAssignModel>({ roleIds: [] });

  /** 打开角色分配弹窗，并以管理员当前已绑定角色作为初始值。 */
  function open(row: ApiManagement.Admin) {
    target.value = row;
    form.value = { roleIds: [...row.roleIds] };
    showModal.value = true;
  }

  /** 计算需要新增和解除的角色绑定关系。 */
  const roleChanges = computed(() => {
    const previous = new Set(target.value?.roleIds ?? []);
    const next = new Set(form.value.roleIds);

    return {
      bindRoleIds: [...next].filter(roleId => !previous.has(roleId)),
      unbindRoleIds: [...previous].filter(roleId => !next.has(roleId))
    };
  });

  async function submit() {
    const admin = target.value;
    if (!admin || submitting.value) return;

    const { bindRoleIds, unbindRoleIds } = roleChanges.value;
    if (!bindRoleIds.length && !unbindRoleIds.length) {
      showModal.value = false;
      return;
    }

    submitting.value = true;
    try {
      // 顺序提交并在首个失败处停止，避免部分成功后继续产生无效请求
      let failed = false;
      for (const roleId of bindRoleIds) {
        const { error } = await bindAdminRole({ adminId: admin.id, roleId });
        if (error) {
          failed = true;
          break;
        }
      }

      if (!failed) {
        for (const roleId of unbindRoleIds) {
          const { error } = await unbindAdminRole({ adminId: admin.id, roleId });
          if (error) {
            failed = true;
            break;
          }
        }
      }

      showModal.value = false;
      await options.onSuccess();
      if (!failed) {
        window.$message?.success('角色绑定已更新');
      }
    } finally {
      submitting.value = false;
    }
  }

  return { showModal, submitting, target, form, roleChanges, open, submit };
}
