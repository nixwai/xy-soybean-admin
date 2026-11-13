<script setup lang="ts">
import { watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NInputNumber, NModal, NSpace, NSwitch } from 'naive-ui';
import type { FormRules } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { useMenuFormSubmit } from '../hooks/use-menu-form-submit';

const emit = defineEmits<{ success: [] }>();
const {
  showModal: visible,
  submitting,
  editing,
  form,
  openEdit,
  submit
} = useMenuFormSubmit({
  onSuccess: () => emit('success')
});
const { formRef, restoreValidation } = useNaiveForm();
const rules: FormRules = {
  title: [{ required: true, message: '请输入菜单标题', trigger: ['input', 'blur'] }],
  order: [{ required: true, type: 'number', message: '请输入排序值', trigger: ['input', 'blur'] }]
};

watch(visible, value => {
  if (value) restoreValidation();
});

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  await submit();
}

defineExpose({
  openEdit
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`编辑菜单 - ${editing?.menuKey ?? ''}`"
    class="w-520px"
    :mask-closable="false"
  >
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
      <NFormItem label="菜单标题" path="title">
        <NInput v-model:value="form.title" placeholder="请输入菜单标题" />
      </NFormItem>
      <NFormItem label="排序" path="order">
        <NInputNumber v-model:value="form.order" :min="0" :precision="0" class="w-full" />
      </NFormItem>
      <NFormItem label="启用状态" path="isActive"><NSwitch v-model:value="form.isActive" /></NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
