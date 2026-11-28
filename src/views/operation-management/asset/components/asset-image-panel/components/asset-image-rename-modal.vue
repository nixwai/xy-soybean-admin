<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';
import { useAssetImageRename } from '../hooks/use-asset-image-rename';

const emit = defineEmits<{ success: [] }>();
const { visible, submitting, name, open, close, submit } = useAssetImageRename(() => emit('success'));

defineExpose({ open, close });
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="重命名图片" class="w-440px" :mask-closable="false">
    <NForm @submit.prevent="submit">
      <NFormItem label="文件名">
        <NInput v-model:value="name" autofocus @keyup.enter="submit" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="submit">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
