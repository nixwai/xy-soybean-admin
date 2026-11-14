<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NEmpty } from 'naive-ui';
import AssetFolderPanel from './components/asset-folder-panel.vue';
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

    <NCard class="min-w-0 flex-1" :bordered="false" title="素材内容">
      <div class="h-full min-h-420px" aria-label="素材内容预留区域">
        <NEmpty v-if="selectedNode?.nodeType === 'folder'" description="该文件夹暂未添加素材内容" class="pt-80px" />
      </div>
    </NCard>
  </div>
</template>
