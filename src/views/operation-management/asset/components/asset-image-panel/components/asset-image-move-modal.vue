<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { NAlert, NButton, NModal, NSelect, NSpace } from 'naive-ui';
import { useAssetContextStore } from '@/views/operation-management/asset/store';
import { useAssetImageMove } from '../hooks/use-asset-image-move';
import { useAssetImageMoveOptions } from '../hooks/use-asset-image-move-options';

const assetContext = useAssetContextStore();
const emit = defineEmits<{ success: [id: string] }>();
const item = shallowRef<ApiManagement.AssetImage | null>(null);
const visible = ref(false);
const targetFolderId = ref<string | null>(null);
const { options, loading, loadError, load } = useAssetImageMoveOptions(
  () => item.value,
  () => assetContext.scopeAll
);
const { submitting, submit } = useAssetImageMove(id => {
  close();
  emit('success', id);
});

function close() {
  visible.value = false;
  item.value = null;
  targetFolderId.value = null;
}

/** 立即打开弹窗，目标文件夹由弹窗内的选择器异步加载。 */
function open(target: ApiManagement.AssetImage) {
  if (submitting.value) return;
  item.value = target;
  targetFolderId.value = null;
  visible.value = true;
  void load();
}

defineExpose({ open, close });
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    title="修改图片位置"
    class="w-440px"
    :mask-closable="false"
    @update:show="show => !show && close()"
  >
    <NAlert v-if="loadError" type="error" title="目标文件夹加载失败">
      <NButton text type="primary" @click="load">重试</NButton>
    </NAlert>
    <NSelect
      v-else
      v-model:value="targetFolderId"
      :options="options"
      :loading="loading"
      :disabled="loading || submitting"
      :placeholder="loading ? '正在加载目标文件夹…' : '请选择目标文件夹'"
    />
    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">取消</NButton>
        <NButton
          type="primary"
          :loading="submitting"
          :disabled="loading || loadError || !targetFolderId"
          @click="item && submit(item, targetFolderId)"
        >
          确定
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
