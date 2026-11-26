<script setup lang="ts">
import { NEmpty, NImage } from 'naive-ui';
import { formatAssetImageDate, formatAssetImageSize, formatAssetImageType } from '../utils/asset-image';

defineOptions({ name: 'AssetImageDetail' });

defineProps<{
  item: ApiManagement.AssetImage | null;
}>();
</script>

<template>
  <aside class="asset-image-detail" aria-label="素材详情">
    <div class="mb-16px flex items-center justify-between">
      <div class="font-600">素材详情</div>
    </div>
    <template v-if="item">
      <div class="asset-image-detail__preview">
        <NImage :src="item.url" :alt="item.originalName" object-fit="contain" width="100%" height="100%" />
      </div>
      <div class="mt-14px truncate text-14px font-600" :title="item.originalName">
        {{ item.originalName }}
      </div>
      <div class="mt-4px text-12px text-#999">{{ formatAssetImageType(item) }}</div>
      <div class="asset-image-detail__table mt-18px">
        <div>
          <span>尺寸</span>
          <strong>{{ item.width }} × {{ item.height }} px</strong>
        </div>
        <div>
          <span>文件大小</span>
          <strong>{{ formatAssetImageSize(item.size) }}</strong>
        </div>
        <div>
          <span>上传时间</span>
          <strong>{{ formatAssetImageDate(item.createdAt) }}</strong>
        </div>
      </div>
    </template>
    <NEmpty v-else description="暂无素材详情" class="py-80px" />
  </aside>
</template>

<style scoped>
.asset-image-detail {
  min-width: 0;
  padding-left: 20px;
  border-left: 1px solid var(--n-divider-color);
}

.asset-image-detail__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1.28;
  padding: 12px;
  border-radius: 8px;
  background: var(--n-color-embedded);
}

.asset-image-detail__preview :deep(.n-image) {
  display: block;
  width: 100%;
  height: 100%;
}

.asset-image-detail__preview :deep(.n-image img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.asset-image-detail__table {
  border-top: 1px solid var(--n-divider-color);
}

.asset-image-detail__table > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  font-size: 12px;
  border-bottom: 1px solid var(--n-divider-color);
}

.asset-image-detail__table span {
  color: var(--n-text-color-3);
}

.asset-image-detail__table strong {
  font-weight: 500;
  text-align: right;
}

@media (max-width: 1400px) {
  .asset-image-detail {
    padding-top: 20px;
    padding-left: 0;
    border-top: 1px solid var(--n-divider-color);
    border-left: 0;
  }
}
</style>
