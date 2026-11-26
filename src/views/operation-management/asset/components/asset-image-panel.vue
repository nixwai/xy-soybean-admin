<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NCard, NEmpty } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { useAssetContextStore } from '../store';
import AssetImageDetail from './asset-image-detail.vue';
import AssetImageList from './asset-image-list.vue';
import AssetImageSearch from './asset-image-search.vue';
import AssetImageUpload from './asset-image-upload.vue';

defineOptions({ name: 'AssetImagePanel' });

const { hasAuth } = useAuth();
const authStore = useAuthStore();
const assetContext = useAssetContextStore();
const imageListRefreshKey = ref(0);
const selectedItem = ref<ApiManagement.AssetImage | null>(null);
/** 已提交的图片名称关键词，由头部搜索组件写入。 */
const keyword = ref('');

const selectedNode = computed(() => assetContext.selectedNode);
const scopeAll = computed(() => assetContext.scopeAll);
/** 当前可上传的目标文件夹 ID，空字符串表示未选中具体文件夹。 */
const folderId = computed(() => (selectedNode.value?.nodeType === 'folder' ? selectedNode.value.key : ''));
const isSearching = computed(() => Boolean(keyword.value.trim()));
const canRead = computed(() => hasAuth(PERMISSION_CODE.ASSET_IMAGE_READ));
const canUpload = computed(() => {
  if (!folderId.value || !hasAuth(PERMISSION_CODE.ASSET_IMAGE_UPLOAD)) return false;
  return selectedNode.value?.ownerId === authStore.userInfo.userId || hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL);
});
/** 头部标题跟随选中节点与查看范围。 */
const panelTitle = computed(() => selectedNode.value?.label ?? (scopeAll.value ? '全部' : '个人素材'));
/** 搜索态无需选中文件夹即可出结果，浏览态仍要求选中具体文件夹。 */
const showImageArea = computed(() => Boolean(folderId.value) || isSearching.value);

/** 接收图片列表当前选中项，供详情面板展示。 */
function handleImageSelect(item: ApiManagement.AssetImage | null) {
  selectedItem.value = item;
}

/** 从第一页重新读取当前范围内的图片，上传完成和主动搜索都会触发。 */
function refreshImageList() {
  imageListRefreshKey.value += 1;
}

watch(
  () => selectedNode.value?.key,
  () => {
    selectedItem.value = null;
  }
);
</script>

<template>
  <NCard class="asset-image-card min-w-0 flex-1 overflow-y-auto" :bordered="false">
    <template #header>
      <div class="truncate text-18px font-600">{{ panelTitle }}</div>
      <AssetImageSearch v-if="canRead" v-model:keyword="keyword" class="w-100 mt-3" @search="refreshImageList" />
    </template>
    <div v-if="!canRead" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty description="暂无素材图片查看权限" />
    </div>
    <div v-else-if="!showImageArea" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty :description="selectedNode ? '请选择具体文件夹查看图片' : '请选择素材文件夹'" />
    </div>
    <div v-else class="asset-image-layout min-h-420px">
      <div class="min-w-0">
        <AssetImageUpload v-if="folderId" :folder-id="folderId" :can-upload="canUpload" @uploaded="refreshImageList" />
        <AssetImageList
          :node="selectedNode"
          :scope-all="scopeAll"
          :keyword="keyword"
          :refresh-key="imageListRefreshKey"
          @select="handleImageSelect"
        />
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
