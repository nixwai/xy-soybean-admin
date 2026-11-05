<script setup lang="ts">
import { computed, watch } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput, NModal, NSpace, NSwitch } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { ROLE_FORM_RULES } from '../config/constants';
import type { RoleFormModel } from '../typings';

interface Props {
  /** 正在编辑的角色，为空表示新增。 */
  editing: ApiManagement.Role | null;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<RoleFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const { formRef, restoreValidation } = useNaiveForm();

const rules = computed(() => ROLE_FORM_RULES);

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
    :title="props.editing ? '编辑角色' : '新增角色'"
    class="w-560px"
    :mask-closable="false"
  >
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="90"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="角色编码" path="code">
        <NInput
          v-model:value="form.code"
          :disabled="Boolean(props.editing)"
          placeholder="以小写字母开头，如 operator"
        />
      </NFormItem>
      <NFormItem label="角色名称" path="name">
        <NInput v-model:value="form.name" placeholder="请输入角色名称" />
      </NFormItem>
      <NFormItem label="角色描述" path="description">
        <NInput
          v-model:value="form.description"
          type="textarea"
          :rows="3"
          maxlength="255"
          show-count
          placeholder="请输入角色描述，可留空"
        />
      </NFormItem>
      <NFormItem v-if="props.editing" label="状态" path="isActive">
        <NSwitch v-model:value="form.isActive" />
        <span class="ml-12px text-12px text-#999">停用后该角色的权限不再对已绑定管理员生效</span>
      </NFormItem>
    </NForm>
    <NAlert v-if="props.editing" type="info" :bordered="false">
      角色编码创建后不可修改，权限绑定请在角色列表的“权限”入口中调整。
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
