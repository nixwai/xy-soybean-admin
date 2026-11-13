<script setup lang="ts">
import { computed, watch } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { createAdminDeleteFormRules } from '../config/rules';
import { useAdminDelete } from '../hooks/use-admin-delete';

const emit = defineEmits<{ success: [] }>();
const {
  showModal: visible,
  submitting,
  target,
  form,
  open,
  submit
} = useAdminDelete({
  onSuccess: () => emit('success')
});

const { formRef, restoreValidation } = useNaiveForm();
const rules = computed(() => createAdminDeleteFormRules());

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
  open
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`删除管理员 - ${target?.username ?? ''}`"
    class="w-520px"
    :mask-closable="false"
  >
    <NAlert type="error" :bordered="false" class="mb-16px">
      删除后该管理员将无法登录，且系统必须保留至少一名启用状态的根管理员。
    </NAlert>
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="当前密码" path="currentPassword">
        <NInput
          v-model:value="form.currentPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入当前登录管理员密码"
          @keyup.enter="handleSubmit"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="error" :loading="submitting" @click="handleSubmit">确认删除</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
