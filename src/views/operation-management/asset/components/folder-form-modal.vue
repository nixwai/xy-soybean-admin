<script setup lang="ts">
import { computed, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import {
  ASSET_FOLDER_FORM_RULES,
  ASSET_FOLDER_GLOBAL_CREATE_RULES,
  ASSET_FOLDER_NAME_MAX_LENGTH
} from '../config/constants';
import type { AssetFolderFormMode, AssetFolderFormModel } from '../typings';

interface Props {
  /** 弹窗模式，决定标题与提交语义。 */
  mode: AssetFolderFormMode;
  /** 新建时展示的父级名称，重命名时为空。 */
  parentLabel?: string;
  /** 提交中状态。 */
  submitting?: boolean;
  /** 是否需要手动输入拥有者 ID。 */
  requireOwnerId?: boolean;
}

const props = withDefaults(defineProps<Props>(), { parentLabel: '', submitting: false, requireOwnerId: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<AssetFolderFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const { formRef, restoreValidation } = useNaiveForm();
const title = computed(() => (props.mode === 'create' ? '新建文件夹' : '重命名文件夹'));
const rules = computed(() => (props.requireOwnerId ? ASSET_FOLDER_GLOBAL_CREATE_RULES : ASSET_FOLDER_FORM_RULES));

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
  <NModal v-model:show="visible" preset="card" :title="title" class="w-440px" :mask-closable="false">
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="文件夹名称" path="name">
        <NInput
          v-model:value="form.name"
          :maxlength="ASSET_FOLDER_NAME_MAX_LENGTH"
          show-count
          placeholder="请输入文件夹名称"
          @keyup.enter="handleSubmit"
        />
      </NFormItem>
      <NFormItem v-if="props.requireOwnerId" label="用户 ID" path="ownerId">
        <NInput v-model:value="form.ownerId" placeholder="请输入 ID" @keyup.enter="handleSubmit" />
      </NFormItem>
    </NForm>
    <div v-if="props.parentLabel" class="mb-12px text-12px text-#999">父级：{{ props.parentLabel }}</div>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="props.submitting" @click="handleSubmit">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
