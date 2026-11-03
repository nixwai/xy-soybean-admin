<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NModal, NSwitch } from 'naive-ui';
import type { MenuFormModel } from '../typings';

defineProps<{ editing: ApiManagement.Menu | null }>();
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<MenuFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="editing ? '编辑菜单' : '新增菜单'" style="width: 560px">
    <NForm label-placement="left" label-width="100">
      <NFormItem label="菜单标题"><NInput v-model:value="form.title" /></NFormItem>
      <NFormItem label="菜单路径"><NInput v-model:value="form.path" /></NFormItem>
      <NFormItem label="图标"><NInput v-model:value="form.icon" placeholder="carbon:menu" /></NFormItem>
      <NFormItem label="排序"><NInput v-model:value="form.order" /></NFormItem>
      <NFormItem label="权限编码"><NInput v-model:value="form.permissionCode" placeholder="可留空" /></NFormItem>
      <NFormItem v-if="editing" label="状态"><NSwitch v-model:value="form.isActive" /></NFormItem>
    </NForm>
    <template #footer><NButton type="primary" @click="emit('submit')">保存</NButton></template>
  </NModal>
</template>
