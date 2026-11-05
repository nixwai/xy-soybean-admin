<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NButton, NEmpty, NForm, NFormItem, NModal, NSelect, NSpace, NSpin } from 'naive-ui';
import type { AdminRoleAssignModel } from '../typings';

interface Props {
  /** 待分配角色的管理员。 */
  target: ApiManagement.Admin | null;
  /** 角色选项数据源。 */
  roles: ApiManagement.Role[];
  /** 本次将新增和解除的绑定关系，用于提交前提示。 */
  changes: { bindRoleIds: string[]; unbindRoleIds: string[] };
  rolesLoading?: boolean;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { rolesLoading: false, submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AdminRoleAssignModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const roleOptions = computed(() =>
  props.roles.map(role => ({
    label: role.isSystem ? `${role.name}（系统角色）` : role.name,
    value: role.id,
    disabled: !role.isActive
  }))
);

const changeSummary = computed(() => {
  const { bindRoleIds, unbindRoleIds } = props.changes;
  if (!bindRoleIds.length && !unbindRoleIds.length) return '未调整角色绑定，保存后不会产生变更。';
  return `本次将新增 ${bindRoleIds.length} 项绑定，解除 ${unbindRoleIds.length} 项绑定。`;
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`分配角色 - ${target?.username ?? ''}`"
    class="w-520px"
    :mask-closable="false"
  >
    <NSpin :show="rolesLoading">
      <NForm :model="form" label-placement="left" label-width="80">
        <NFormItem label="绑定角色">
          <NSelect
            v-model:value="form.roleIds"
            multiple
            clearable
            :options="roleOptions"
            placeholder="请选择角色"
            :max-tag-count="3"
          />
        </NFormItem>
      </NForm>
      <NEmpty v-if="!rolesLoading && !roles.length" description="暂无可用角色，请先在角色管理中创建" class="py-16px" />
      <NAlert type="info" :bordered="false">{{ changeSummary }}</NAlert>
      <NAlert v-if="target?.isRoot" type="warning" :bordered="false" class="mt-8px">
        根管理员拥有系统全部权限，角色绑定仅作为标识，不会影响其实际权限。
      </NAlert>
    </NSpin>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="emit('submit')">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
