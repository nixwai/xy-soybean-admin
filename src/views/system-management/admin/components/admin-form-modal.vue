<script setup lang="ts">
import { computed, watch } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput, NModal, NSpace, NSwitch } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { createAdminFormRules } from '../config/rules';
import type { AdminFormModel } from '../typings';

interface Props {
  /** 正在编辑的管理员，为空表示新增。 */
  editing: ApiManagement.Admin | null;
  /** 本次提交是否需要复核当前登录管理员密码。 */
  needCurrentPassword: boolean;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AdminFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const { formRef, restoreValidation } = useNaiveForm();

const rules = computed(() =>
  createAdminFormRules({
    isEdit: Boolean(props.editing),
    needCurrentPassword: props.needCurrentPassword,
    getPassword: () => form.value.password
  })
);

const currentPasswordTip = computed(() => {
  if (form.value.isRoot) return '变更根管理员身份需要复核当前登录管理员密码。';
  if (props.editing?.isRoot) return '目标为根管理员，任何修改都需要复核当前登录管理员密码。';
  return '修改密码需要复核当前登录管理员密码。';
});

// 弹窗每次打开时清理上一次的校验残留
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
    :title="editing ? '编辑管理员' : '新增管理员'"
    class="w-560px"
    :mask-closable="false"
  >
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="110"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="用户名" path="username">
        <NInput v-model:value="form.username" placeholder="3-64 位字母、数字、点、下划线或连字符" />
      </NFormItem>
      <NFormItem :label="editing ? '新密码' : '初始密码'" path="password">
        <NInput
          v-model:value="form.password"
          type="password"
          show-password-on="click"
          :placeholder="editing ? '留空表示不修改密码' : '8-72 位且同时包含字母和数字'"
        />
      </NFormItem>
      <NFormItem v-if="!editing || form.password" label="确认密码" path="confirmPassword">
        <NInput
          v-model:value="form.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入密码"
        />
      </NFormItem>
      <NFormItem label="根管理员" path="isRoot">
        <NSwitch v-model:value="form.isRoot" />
        <span class="ml-12px text-12px text-#999">根管理员拥有系统全部权限，不受角色和权限编码限制</span>
      </NFormItem>
      <NFormItem v-if="editing" label="状态" path="isActive">
        <NSwitch v-model:value="form.isActive" />
        <span class="ml-12px text-12px text-#999">停用后该管理员无法登录</span>
      </NFormItem>
      <NFormItem v-if="needCurrentPassword" label="当前密码" path="currentPassword">
        <NInput
          v-model:value="form.currentPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入当前登录管理员密码"
        />
      </NFormItem>
    </NForm>
    <NAlert v-if="needCurrentPassword" type="warning" :bordered="false" class="mt-4px">
      {{ currentPasswordTip }}
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
