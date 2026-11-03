<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NModal } from 'naive-ui';
import type { AdminPasswordFormModel } from '../typings';

const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AdminPasswordFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="重置管理员密码" style="width: 520px">
    <NForm label-placement="left" label-width="110">
      <NFormItem label="新密码">
        <NInput v-model:value="form.password" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem label="当前密码">
        <NInput v-model:value="form.currentPassword" type="password" show-password-on="click" />
      </NFormItem>
    </NForm>
    <template #footer><NButton type="primary" @click="emit('submit')">确认重置</NButton></template>
  </NModal>
</template>
