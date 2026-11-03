<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSwitch } from 'naive-ui';
import type { AdminFormModel } from '../typings';

defineProps<{ editing: ApiManagement.Admin | null; roles: ApiManagement.Role[] }>();
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AdminFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="editing ? '编辑管理员' : '新增管理员'" style="width: 520px">
    <NForm label-placement="left" label-width="110">
      <NFormItem label="用户名"><NInput v-model:value="form.username" /></NFormItem>
      <NFormItem v-if="!editing" label="初始密码">
        <NInput v-model:value="form.password" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem v-else label="新密码">
        <NInput v-model:value="form.password" type="password" show-password-on="click" placeholder="留空表示不修改" />
      </NFormItem>
      <NFormItem label="超级管理员"><NSwitch v-model:value="form.isSuperAdmin" /></NFormItem>
      <NFormItem label="绑定角色">
        <NSelect
          v-model:value="form.roleIds"
          multiple
          :options="roles.map(role => ({ label: role.name, value: role.id }))"
        />
      </NFormItem>
      <NFormItem v-if="form.isSuperAdmin || form.password" label="当前密码">
        <NInput v-model:value="form.currentPassword" type="password" show-password-on="click" />
      </NFormItem>
    </NForm>
    <template #footer><NButton type="primary" @click="emit('submit')">保存</NButton></template>
  </NModal>
</template>
