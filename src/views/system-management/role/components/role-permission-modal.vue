<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NButton, NCheckbox, NCheckboxGroup, NEmpty, NModal, NSpace, NSpin, NTag } from 'naive-ui';
import type { RolePermissionAssignModel } from '../typings';

interface Props {
  /** 待分配权限的角色。 */
  target: ApiManagement.Role | null;
  /** 可绑定给普通角色的分组权限目录。 */
  groups: ApiManagement.PermissionGroup[];
  /** 本次将新增和解除的绑定关系。 */
  changes: { bindPermissionIds: string[]; unbindPermissionIds: string[] };
  /** 角色已绑定但不在可分配目录中的权限 ID。 */
  unmanagedPermissionIds: string[];
  loading?: boolean;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { loading: false, submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<RolePermissionAssignModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const isEmpty = computed(() => !props.groups.some(group => group.permissions.length));

const changeSummary = computed(() => {
  const { bindPermissionIds, unbindPermissionIds } = props.changes;
  if (!bindPermissionIds.length && !unbindPermissionIds.length) return '未调整权限绑定，保存后不会产生变更。';
  return `本次将新增 ${bindPermissionIds.length} 项绑定，解除 ${unbindPermissionIds.length} 项绑定。`;
});

/** 全选或清空当前可分配目录中的权限。 */
function toggleAll(checked: boolean) {
  form.value = {
    permissionIds: checked ? props.groups.flatMap(group => group.permissions.map(item => item.id)) : []
  };
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`分配权限 - ${target?.name ?? ''}`"
    class="w-680px"
    :mask-closable="false"
  >
    <NSpin :show="loading">
      <div class="mb-12px flex-y-center justify-between">
        <span class="text-13px text-#666">仅展示可绑定给普通角色的启用权限，受保护权限由根管理员独占</span>
        <NSpace :size="8">
          <NButton size="tiny" @click="toggleAll(true)">全选</NButton>
          <NButton size="tiny" @click="toggleAll(false)">清空</NButton>
        </NSpace>
      </div>
      <NEmpty v-if="!loading && isEmpty" description="暂无可分配权限" class="py-24px" />
      <NCheckboxGroup v-else v-model:value="form.permissionIds" class="block max-h-420px w-full overflow-y-auto pr-4px">
        <div v-for="group in groups" :key="group.category" class="mb-16px">
          <div class="mb-8px flex-y-center gap-8px">
            <span class="text-14px font-500">{{ group.categoryName }}</span>
            <NTag size="tiny" :bordered="false">{{ group.permissions.length }} 项</NTag>
          </div>
          <div class="grid grid-cols-2 gap-x-16px gap-y-8px">
            <NCheckbox
              v-for="permission in group.permissions"
              :key="permission.id"
              :value="permission.id"
              :label="permission.name"
            />
          </div>
        </div>
      </NCheckboxGroup>
      <NAlert type="info" :bordered="false" class="mt-8px">{{ changeSummary }}</NAlert>
      <NAlert v-if="unmanagedPermissionIds.length" type="warning" :bordered="false" class="mt-8px">
        该角色还绑定了 {{ unmanagedPermissionIds.length }} 项当前不可分配的权限，本次保存不会影响它们。
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
