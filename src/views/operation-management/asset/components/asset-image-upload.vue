<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NUpload } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { filterAssetImageFiles } from '../utils/asset-image';
import { useAssetImageUpload } from '../hooks/use-asset-image-upload';

defineOptions({ name: 'AssetImageUpload' });

const props = defineProps<{
  folderId: string;
  canUpload: boolean;
}>();

const emit = defineEmits<{
  uploaded: [result: ApiManagement.AssetImageUploadResponse];
}>();

const { upload, uploading } = useAssetImageUpload();
const filePickerRef = ref<InstanceType<typeof NUpload> | null>(null);
const dragging = ref(false);

/** 校验并上传当前文件夹下的图片。 */
async function handleFiles(files: readonly File[]) {
  if (!props.canUpload || uploading.value) return;

  const imageFiles = filterAssetImageFiles(files);
  if (imageFiles.length !== files.length) {
    window.$message?.warning('仅支持 JPG、PNG、WebP、GIF 图片');
  }
  if (!imageFiles.length) return;

  const result = await upload(props.folderId, imageFiles);
  filePickerRef.value?.clear();
  if (!result) return;

  if (result.failed.length) {
    window.$message?.warning(`成功上传 ${result.successCount} 张，${result.failed.length} 张失败`);
  } else {
    window.$message?.success(`成功上传 ${result.successCount} 张图片`);
  }
  emit('uploaded', result);
}

/** 接收文件选择器选中的文件。 */
function handleUploadChange(data: { fileList: UploadFileInfo[] }) {
  const files = data.fileList.flatMap(item => (item.file ? [item.file] : []));
  void handleFiles(files);
}

/** 接收拖拽到上传区域的文件。 */
function handleDrop(event: DragEvent) {
  dragging.value = false;
  const files = event.dataTransfer?.files ? [...event.dataTransfer.files] : [];
  void handleFiles(files);
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  dragging.value = true;
}

function handleDragLeave() {
  dragging.value = false;
}
</script>

<template>
  <div
    class="upload-guide mb-16px"
    :class="{ 'upload-guide--dragging': dragging }"
    @dragenter.prevent="handleDragOver"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="upload-guide__icon">
      <icon-ic-round-upload class="text-24px" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="font-600">将图片拖到这里上传</div>
      <div class="mt-4px text-12px text-#999">支持 JPG、PNG、WebP、GIF，上传后自动处理</div>
    </div>
    <NUpload
      v-if="canUpload"
      ref="filePickerRef"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      :default-upload="false"
      :show-file-list="false"
      @change="handleUploadChange"
    >
      <NButton secondary :loading="uploading">选择本地图片</NButton>
    </NUpload>
  </div>
</template>

<style scoped>
.upload-guide {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 14px;
  min-height: 76px;
  padding: 16px 20px;
  border: 1px dashed var(--n-border-color);
  border-radius: 8px;
  background: rgba(24, 160, 88, 0.02);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.upload-guide > :deep(.n-upload) {
  flex: 0 0 auto;
  width: auto;
  margin-left: auto;
}

.upload-guide--dragging {
  border-color: var(--n-primary-color);
  background: rgba(24, 160, 88, 0.08);
}

.upload-guide__icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  color: var(--n-primary-color);
  border-radius: 8px;
  background: rgba(24, 160, 88, 0.1);
}

@media (max-width: 1400px) {
  .upload-guide {
    gap: 12px;
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
