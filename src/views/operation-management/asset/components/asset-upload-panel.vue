<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { NButton, NUpload, NUploadDragger } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { useAssetUpload } from '../hooks/use-asset-upload';
import { useAssetUploadLimits } from '../hooks/use-asset-upload-limits';

const props = defineProps<{
  ownerId: string | null;
  folderId: string | null;
  allowed: (ownerId: string, folderId: string | null) => boolean;
}>();
const emit = defineEmits<{ changed: [] }>();
const fileInput = ref<HTMLInputElement>();
const { limits, loading: limitsLoading, error: limitsError, reload: reloadLimits } = useAssetUploadLimits();
const uploadDisabled = computed(() => !limits.value || !props.ownerId || !props.allowed(props.ownerId, props.folderId));
const { entries, busy, hasFailed, add, retry } = useAssetUpload(
  (ownerId, folderId) => props.allowed(ownerId, folderId),
  () => emit('changed'),
  () => limits.value
);

function receive(files: File[]) {
  if (uploadDisabled.value || !props.ownerId) return;
  void add(files, { ownerId: props.ownerId, folderId: props.folderId });
}
// Naive UI 对每个文件触发 before-upload；在同一微任务内合并本次选择并禁止内置请求。
let selectedFiles: File[] = [];
function selectUploadFile({ file }: { file: UploadFileInfo }) {
  if (!file.file) return false;
  const first = selectedFiles.length === 0;
  selectedFiles = [...selectedFiles, file.file];
  if (first)
    queueMicrotask(() => {
      const files = selectedFiles;
      selectedFiles = [];
      receive(files);
    });
  return false;
}
function choose(event: Event) {
  const input = event.target as HTMLInputElement;
  receive(Array.from(input.files ?? []));
  input.value = '';
}
function paste(event: ClipboardEvent) {
  if (uploadDisabled.value || busy.value) return;
  const files = Array.from(event.clipboardData?.files ?? []).filter(file => file.type.startsWith('image/'));
  if (!files.length) return;
  event.preventDefault();
  receive(files);
}
useEventListener('paste', paste);
onMounted(reloadLimits);
</script>

<template>
  <div class="mb-16px">
    <div class="mb-8px flex items-center gap-12px" aria-live="polite">
      <span v-if="limitsLoading" class="text-12px text-gray">正在加载上传配置，暂不可上传</span>
      <span v-else-if="limitsError" role="alert" class="text-12px text-error">{{ limitsError }}</span>
      <span v-else-if="limits" class="text-12px text-gray">
        单文件上限 {{ limits.maxFileSize }} 字节；单批上限 {{ limits.maxBatchSize }} 字节
      </span>
      <NButton size="small" :loading="limitsLoading" :disabled="busy || limitsLoading" @click="reloadLimits">
        重新加载配置
      </NButton>
    </div>
    <div class="mb-8px flex items-center gap-12px">
      <NButton type="primary" :loading="busy" :disabled="busy || uploadDisabled" @click="fileInput?.click()">
        上传图片
      </NButton>
      <span class="text-12px text-gray">点击、拖拽或粘贴图片，均上传至当前归属和目录</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        aria-label="选择上传图片"
        @change="choose"
      />
    </div>
    <NUpload
      :default-upload="false"
      :show-file-list="false"
      :file-list="[]"
      :disabled="busy || uploadDisabled"
      accept="image/*"
      multiple
      :on-before-upload="selectUploadFile"
    >
      <NUploadDragger>将图片拖拽至此，或点击选择批量上传</NUploadDragger>
    </NUpload>
    <div v-if="entries.length" class="mt-12px max-h-180px overflow-auto" aria-live="polite">
      <div v-for="entry in entries" :key="entry.id" class="flex gap-12px py-4px text-12px">
        <span class="min-w-0 flex-1 truncate">
          {{ entry.file.name }}（归属 {{ entry.ownerId }} / {{ entry.folderId || '未分类' }}）
        </span>
        <span :class="entry.status === 'failed' ? 'text-error' : ''">
          {{ entry.status === 'success' ? '上传成功' : entry.status === 'failed' ? entry.reason : '上传中' }}
        </span>
      </div>
    </div>
    <NButton v-if="hasFailed" class="mt-8px" size="small" :disabled="busy || !limits" @click="retry">
      仅重试失败文件（保留原归属和目录）
    </NButton>
  </div>
</template>
