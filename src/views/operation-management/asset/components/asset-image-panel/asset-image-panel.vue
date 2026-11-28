<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { NCard, NEmpty } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { useAssetContextStore } from '@/views/operation-management/asset/store';
import type { AssetImageAction } from '@/views/operation-management/asset/typings';
import { useAssetImageStore } from './store/asset-image-store';
import { useAssetImageAccess } from './hooks/use-asset-image-access';
import { useAssetImageDelete } from './hooks/use-asset-image-delete';
import AssetImageDetail from './components/asset-image-detail.vue';
import AssetImageList from './components/asset-image-list.vue';
import AssetImageMoveModal from './components/asset-image-move-modal.vue';
import AssetImageRenameModal from './components/asset-image-rename-modal.vue';
import AssetImageSearch from './components/asset-image-search.vue';
import AssetImageUpload from './components/asset-image-upload.vue';

defineOptions({ name: 'AssetImagePanel' });

const { hasAuth } = useAuth();
const authStore = useAuthStore();
const assetContext = useAssetContextStore();
const imageStore = useAssetImageStore();
const { canRead, getImageActions } = useAssetImageAccess();
const renameModal = ref<InstanceType<typeof AssetImageRenameModal> | null>(null);
const moveModal = ref<InstanceType<typeof AssetImageMoveModal> | null>(null);
let panelActive = true;
const { open: openDelete, close: closeDelete } = useAssetImageDelete(id => {
  if (panelActive) imageStore.refreshAfterRemoval(id);
});
onBeforeUnmount(() => {
  panelActive = false;
  closeDelete();
  imageStore.reset();
});

const selectedNode = computed(() => assetContext.selectedNode);
const scopeAll = computed(() => assetContext.scopeAll);
/** 当前可上传的目标文件夹 ID，空字符串表示未选中具体文件夹。 */
const folderId = computed(() => (selectedNode.value?.nodeType === 'folder' ? selectedNode.value.key : ''));
const isSearching = computed(() => Boolean(imageStore.keyword));
const canUpload = computed(() => {
  if (!folderId.value || !hasAuth(PERMISSION_CODE.ASSET_IMAGE_UPLOAD)) return false;
  return selectedNode.value?.ownerId === authStore.userInfo.userId || hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL);
});
/** 头部标题跟随选中节点与查看范围。 */
const panelTitle = computed(() => selectedNode.value?.label ?? (scopeAll.value ? '全部' : '个人素材'));
/** 搜索态无需选中文件夹即可出结果，浏览态仍要求选中具体文件夹。 */
const showImageArea = computed(() => Boolean(folderId.value) || isSearching.value);

/** 两个入口使用同一套操作、弹窗和列表刷新逻辑。 */
async function handleImageAction(action: AssetImageAction, item: ApiManagement.AssetImage) {
  if (!getImageActions(item).some(option => option.key === action)) return;
  switch (action) {
    case 'rename':
      renameModal.value?.open(item);
      break;
    case 'move':
      moveModal.value?.open(item);
      break;
    case 'delete':
      openDelete(item);
      break;
    case 'copy':
      try {
        await navigator.clipboard.writeText(item.url);
        window.$message?.success('图片链接已复制');
      } catch {
        window.$message?.error('复制链接失败');
      }
      break;
    default:
      break;
  }
}

watch([() => selectedNode.value?.key, scopeAll], () => imageStore.clearSelection());

watch([() => selectedNode.value?.key, scopeAll, () => imageStore.keyword, canRead], () => {
  renameModal.value?.close();
  moveModal.value?.close();
  closeDelete();
});
</script>

<template>
  <NCard class="asset-image-card min-w-0 flex-1 overflow-y-auto" :bordered="false">
    <template #header>
      <div class="flex items-center">
        <div class="truncate text-18px font-600">{{ panelTitle }}</div>
        <AssetImageSearch v-if="canRead" class="w-100 ml-3" />
      </div>
    </template>
    <div v-if="!canRead" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty description="暂无素材图片查看权限" />
    </div>
    <div v-else-if="!showImageArea" class="h-full min-h-420px flex items-center justify-center">
      <NEmpty :description="selectedNode ? '请选择具体文件夹查看图片' : '请选择素材文件夹'" />
    </div>
    <div v-else class="asset-image-layout min-h-420px">
      <div class="min-w-0">
        <AssetImageUpload
          v-if="folderId"
          :folder-id="folderId"
          :can-upload="canUpload"
          @uploaded="imageStore.refresh()"
        />
        <AssetImageList @action="handleImageAction" />
      </div>
      <AssetImageDetail @action="handleImageAction" />
      <AssetImageRenameModal ref="renameModal" @success="imageStore.refresh()" />
      <AssetImageMoveModal ref="moveModal" @success="imageStore.refreshAfterRemoval" />
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
