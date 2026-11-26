<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NCard, NEmpty } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import type { AssetTreeOption } from '../typings';
import AssetImageDetail from './asset-image-detail.vue';
import AssetImageList from './asset-image-list.vue';
import AssetImageUpload from './asset-image-upload.vue';

defineOptions({ name: 'AssetImagePanel' });

const props = defineProps<{ node: AssetTreeOption | null }>();

const { hasAuth } = useAuth();
const authStore = useAuthStore();
const imageListRefreshKey = ref(0);
const selectedItem = ref<ApiManagement.AssetImage | null>(null);

const isFolder = computed(() => props.node?.nodeType === 'folder');
const canRead = computed(() => hasAuth(PERMISSION_CODE.ASSET_IMAGE_READ));
const canUpload = computed(() => {
  if (!isFolder.value || !hasAuth(PERMISSION_CODE.ASSET_IMAGE_UPLOAD)) return false;
  return props.node?.ownerId === authStore.userInfo.userId || hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL);
});

/** 接收图片列表当前选中项，供详情面板展示。 */
function handleImageSelect(item: ApiManagement.AssetImage | null) {
  selectedItem.value = item;
}

/** 上传完成后从第一页重新读取当前文件夹图片。 */
function handleUploaded() {
  imageListRefreshKey.value += 1;
}

watch(
  () => props.node?.key,
  () => {
    selectedItem.value = null;
  }
);
</script>

<template>
  <NCard class="asset-image-card min-w-0 flex-1" :borderkonged="false">
    <template #header>
      <div class="text-18px font-600">{{ node?.label ?? '全部' }}</div>
    </template>
    <div v-if="!node" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty description="请选择素材文件夹" />
    </div>
    <div v-else-if="node.nodeType === 'owner'" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty description="请选择具体文件夹查看图片" />
    </div>
    <div v-else-if="!canRead" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty description="暂无素材图片查看权限" />
    </div>
    <div v-else class="asset-image-layout min-h-420px">
      <div class="min-w-0">
        <AssetImageUpload :folder-id="node.key" :can-upload="canUpload" @uploaded="handleUploaded" />
        <AssetImageList :node="node" :refresh-key="imageListRefreshKey" @select="handleImageSelect" />
      </div>
      <AssetImageDetail :item="selectedItem" />
    </div>
  </NCard>
</template>

<style scoped>
.asset-image-card :deep(.n-card__content) {
  height: calc(100% - 24px);
}

.asset-image-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
}

@media (max-width: 1400px) {
  .asset-image-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
