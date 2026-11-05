<script setup lang="ts">
import { computed, reactive } from 'vue';
import { encryptPassword } from '@/utils/security';
import { useAuthStore } from '@/store/modules/auth';
import { useNaiveForm } from '@/hooks/common/form';

defineOptions({ name: 'PwdLogin' });

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  userName: string;
  password: string;
}

const model = reactive<FormModel>({ userName: 'admin', password: '' });

// 登录只校验凭据是否匹配，密码格式约束由后端在创建和重置时执行，这里只做非空和长度上限校验
const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => ({
  userName: [{ required: true, message: '请输入管理员用户名', trigger: ['input', 'blur'] }],
  password: [
    { required: true, message: '请输入管理员密码', trigger: ['input', 'blur'] },
    { max: 72, message: '密码长度不能超过 72 个字符', trigger: ['input', 'blur'] }
  ]
}));

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
    <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
      登录
    </NButton>
  </NForm>
</template>
