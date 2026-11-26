<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NInputGroup } from 'naive-ui';

defineOptions({ name: 'AssetImageSearch' });

/** 已提交给图片列表的搜索关键词，空字符串表示浏览态。 */
const keyword = defineModel<string>('keyword', { required: true });

const emit = defineEmits<{
  /** 用户主动发起搜索，调用方据此刷新列表。 */
  search: [];
}>();

/** 输入框文本，只有点击搜索按钮或回车才会提交给列表。 */
const text = ref(keyword.value);

/** 归一化输入文本、写入关键词并通知调用方重新查询。 */
function commit() {
  const next = text.value.trim();
  text.value = next;
  keyword.value = next;
  emit('search');
}

/** 清空输入并立即回到浏览态。 */
function handleClear() {
  text.value = '';
  keyword.value = '';
  emit('search');
}
</script>

<template>
  <NInputGroup>
    <NInput
      v-model:value="text"
      clearable
      placeholder="搜索图片名称"
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
