<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NInputGroup } from 'naive-ui';
import { useAssetImageStore } from '../store/asset-image-store';

defineOptions({ name: 'AssetImageSearch' });

const imageStore = useAssetImageStore();
/** 输入内容仅在主动搜索或清空时写入共享查询状态。 */
const text = ref(imageStore.keyword);

function commit() {
  imageStore.commitSearch(text.value);
  text.value = imageStore.keyword;
}

function handleClear() {
  text.value = '';
  imageStore.commitSearch('');
}
</script>

<template>
  <NInputGroup>
    <NInput
      v-model:value="text"
      clearable
      placeholder="在当前文件夹下搜索图片"
      aria-label="搜索素材图片名称"
      @keyup.enter="commit"
      @clear="handleClear"
    >
      <template #prefix>
        <icon-ic-round-search class="text-icon" />
      </template>
    </NInput>
    <NButton type="primary" @click="commit">搜索</NButton>
  </NInputGroup>
</template>
