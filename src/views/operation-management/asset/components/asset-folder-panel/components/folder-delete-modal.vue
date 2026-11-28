<script setup lang="ts">
import { NAlert, NButton, NModal, NSpace } from 'naive-ui';
import { useAssetFolderDelete } from '../hooks/use-asset-folder-delete';

const emit = defineEmits<{ success: [] }>();
const {
  showModal: visible,
  submitting,
  target,
  open,
  submit
} = useAssetFolderDelete({
  onSuccess: () => emit('success')
});

defineExpose({
  open
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="删除文件夹" class="w-440px" :mask-closable="false">
    <NAlert type="warning" :bordered="false">
      确定删除“{{ target?.label ?? '' }}”吗？仅允许删除没有子文件夹的目录。
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="error" :loading="submitting" @click="submit">删除</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
