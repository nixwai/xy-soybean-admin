<script setup lang="ts">
import { NAlert, NButton, NModal, NSpace } from 'naive-ui';

interface Props {
  /** 待删除文件夹名称。 */
  folderName: string;
  /** 提交中状态。 */
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="删除文件夹" class="w-440px" :mask-closable="false">
    <NAlert type="warning" :bordered="false">确定删除“{{ props.folderName }}”吗？仅允许删除没有子文件夹的目录。</NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="error" :loading="props.submitting" @click="emit('submit')">删除</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
