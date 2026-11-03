<script setup lang="ts">
import { computed, reactive } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { encryptPassword } from '@/utils/security';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useRouterPush } from '@/hooks/common/router';

defineOptions({ name: 'PwdLogin' });
const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
interface FormModel {
  userName: string;
  password: string;
}
const model = reactive<FormModel>({ userName: 'admin', password: '' });
const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();
  return {
    userName: [{ required: true, message: '请输入管理员用户名', trigger: 'blur' }],
    password: [...formRules.pwd]
  };
});
async function handleSubmit() {
  await validate();
  await authStore.login(model.userName, await encryptPassword(model.password));
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName"><NInput v-model:value="model.userName" placeholder="请输入管理员用户名" /></NFormItem>
    <NFormItem path="password">
      <NInput v-model:value="model.password" type="password" show-password-on="click" placeholder="请输入管理员密码" />
    </NFormItem>
    <NSpace vertical :size="18">
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        登录
      </NButton>
      <NButton quaternary block @click="toggleLoginModule('reset-pwd')">
        {{ $t(loginModuleRecord['reset-pwd']) }}
      </NButton>
    </NSpace>
  </NForm>
</template>
