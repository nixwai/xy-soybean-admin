<script setup lang="ts">
import { computed, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { createAdminPasswordFormRules } from '../config/rules';
import type { AdminPasswordFormModel } from '../typings';

interface Props {
  /** 待重置密码的管理员。 */
  target: ApiManagement.Admin | null;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AdminPasswordFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const { formRef, restoreValidation } = useNaiveForm();

const rules = computed(() => createAdminPasswordFormRules(() => form.value.password));

watch(visible, value => {
  if (value) restoreValidation();
});

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  emit('submit');
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`重置密码 - ${props.target?.username ?? ''}`"
    class="w-520px"
    :mask-closable="false"
  >
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="新密码" path="password">
        <NInput
          v-model:value="form.password"
          type="password"
          show-password-on="click"
          placeholder="8-72 位且同时包含字母和数字"
        />
      </NFormItem>
      <NFormItem label="确认新密码" path="confirmPassword">
        <NInput
          v-model:value="form.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入新密码"
        />
      </NFormItem>
      <NFormItem label="当前密码" path="currentPassword">
        <NInput
          v-model:value="form.currentPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入当前登录管理员密码"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">确认重置</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
