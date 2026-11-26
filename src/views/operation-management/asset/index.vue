<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useAssetContextStore } from './store';
import AssetFolderPanel from './components/asset-folder-panel.vue';
import AssetImagePanel from './components/asset-image-panel.vue';

const assetContext = useAssetContextStore();

// 页面级上下文只服务当前页面，离开时恢复默认查看范围与选中节点。
onUnmounted(() => assetContext.reset());
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px">
    <AssetFolderPanel />
    <AssetImagePanel />
  </div>
</template>
