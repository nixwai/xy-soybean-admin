<script setup lang="ts">
import { ref } from 'vue';
import AssetFolderPanel from './components/asset-folder-panel.vue';
import AssetImagePanel from './components/asset-image-panel.vue';
import type { AssetTreeOption } from './typings';

const selectedNode = ref<AssetTreeOption | null>(null);

/** 接收文件夹面板的选中节点，为右侧素材内容提供当前上下文。 */
function handleFolderSelect(node: AssetTreeOption | null) {
  selectedNode.value = node;
}
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px">
    <AssetFolderPanel @select="handleFolderSelect" />
    <AssetImagePanel :node="selectedNode" />
  </div>
</template>
