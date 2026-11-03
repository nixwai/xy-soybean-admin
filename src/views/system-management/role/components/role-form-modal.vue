<script setup lang="ts">
import { NButton, NCheckbox, NCheckboxGroup, NForm, NFormItem, NInput, NModal, NSwitch } from 'naive-ui';
import type { RoleFormModel } from '../typings';

defineProps<{ editing: ApiManagement.Role | null; permissions: ApiManagement.Permission[] }>();
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<RoleFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="editing ? '编辑角色' : '新增角色'" style="width: 620px">
    <NForm label-placement="left" label-width="100">
      <NFormItem label="角色编码"><NInput v-model:value="form.code" :disabled="Boolean(editing)" /></NFormItem>
      <NFormItem label="角色名称"><NInput v-model:value="form.name" /></NFormItem>
      <NFormItem label="角色描述"><NInput v-model:value="form.description" type="textarea" /></NFormItem>
      <NFormItem v-if="editing" label="状态"><NSwitch v-model:value="form.isActive" /></NFormItem>
      <NFormItem label="权限">
        <NCheckboxGroup v-model:value="form.permissionIds" class="grid grid-cols-2 gap-8px">
          <NCheckbox
            v-for="permission in permissions"
            :key="permission.id"
            :value="permission.id"
            :label="permission.name"
          />
        </NCheckboxGroup>
      </NFormItem>
    </NForm>
    <template #footer><NButton type="primary" @click="emit('submit')">保存</NButton></template>
  </NModal>
</template>
