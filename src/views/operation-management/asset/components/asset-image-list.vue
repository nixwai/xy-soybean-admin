<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NAlert, NEmpty, NImage, NPagination, NSpin, NTag } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuth } from '@/hooks/business/auth';
import { formatAssetImageSize, formatAssetImageType } from '../utils/asset-image';
import { useAssetImageQuery } from '../hooks/use-asset-image-query';
import type { AssetTreeOption, AssetImageQueryContext } from '../typings';

defineOptions({ name: 'AssetImageList' });

const props = defineProps<{
  node: AssetTreeOption | null;
  scopeAll: boolean;
  keyword: string;
  refreshKey: number;
}>();

const emit = defineEmits<{
  select: [item: ApiManagement.AssetImage | null];
}>();

const { hasAuth } = useAuth();
const canRead = computed(() => hasAuth(PERMISSION_CODE.ASSET_IMAGE_READ));
const { items, load, loading, page, pageSize, selectedId, select, total } = useAssetImageQuery();
const loadError = ref(false);
const selectedItem = computed(() => items.value.find(item => item.id === selectedId.value) ?? items.value[0] ?? null);
/** 关键词非空即进入搜索态，此时结果不再局限于当前文件夹的直属图片。 */
const isSearching = computed(() => Boolean(props.keyword.trim()));
/** 搜索态下的范围说明，避免用户误判结果来源。 */
const searchScopeLabel = computed(() => {
  if (!isSearching.value) return '';
  if (props.node?.nodeType === 'folder') return '含子文件夹';
  if (props.node?.nodeType === 'owner') return `${props.node.label} 全部文件夹`;
  return props.scopeAll ? '全部账号素材' : '个人素材';
});

/** 查询当前上下文对应的图片，并将请求失败转换为列表展示状态。 */
async function reload(targetPage = page.value) {
  loadError.value = false;
  const context: AssetImageQueryContext = canRead.value
    ? { node: props.node, scopeAll: props.scopeAll, keyword: props.keyword }
    : { node: null, scopeAll: false, keyword: '' };
  const success = await load(context, targetPage);
  loadError.value = !success;
  return success;
}

/** 切换图片分页。 */
async function handlePageChange(value: number) {
  await reload(value);
}

function handleSelect(item: ApiManagement.AssetImage) {
  select(item);
}

watch(
  [() => props.node?.key, () => props.scopeAll, () => props.keyword, () => canRead.value, () => props.refreshKey],
  () => {
    void reload(1);
  },
  { immediate: true }
);

watch(
  selectedItem,
  item => {
    emit('select', item);
  },
  { immediate: true }
);
</script>

<template>
  <NAlert v-if="loadError" type="error" class="mb-16px" title="素材加载失败">请稍后重试或调整搜索条件。</NAlert>

  <NSpin :show="loading">
    <div class="mb-12px h-8 flex items-center justify-between">
      <span class="text-12px text-#999">{{ total }} 个素材</span>
      <NTag v-if="searchScopeLabel" size="small" :bordered="false">{{ searchScopeLabel }}</NTag>
    </div>
    <NEmpty
      v-if="!items.length && !loading"
      :description="isSearching ? '未找到匹配的图片' : '该文件夹暂未添加素材图片'"
      class="py-80px"
    />
    <div v-else class="asset-image-grid">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="asset-image-item"
        :class="{
          'asset-image-item--selected': selectedItem?.id === item.id
        }"
        :aria-label="`查看 ${item.originalName}`"
        @click="handleSelect(item)"
      >
        <div class="asset-image-item__thumb">
          <NImage :src="item.url" :alt="item.originalName" object-fit="contain" width="100%" height="100%" />
        </div>
        <div class="asset-image-item__body">
          <div class="truncate text-13px font-600">
            {{ item.originalName }}
          </div>
          <div class="mt-5px flex justify-between text-11px text-#999">
            <span>{{ formatAssetImageType(item) }}</span>
            <span>{{ formatAssetImageSize(item.size) }}</span>
          </div>
        </div>
      </button>
    </div>
    <div v-if="total" class="mt-16px flex justify-end">
      <NPagination
        :page="page"
        :page-size="pageSize"
        :item-count="total"
        :page-slot="5"
        @update:page="handlePageChange"
      />
    </div>
  </NSpin>
</template>

<style scoped>
.asset-image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.asset-image-item {
  overflow: hidden;
  padding: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  background: var(--n-card-color);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.asset-image-item:hover,
.asset-image-item--selected {
  border-color: var(--n-primary-color);
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.12);
  transform: translateY(-1px);
}

.asset-image-item__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1.4;
  padding: 8px;
  background: var(--n-color-embedded);
}

.asset-image-item__thumb :deep(.n-image) {
  display: block;
  width: 100%;
  height: 100%;
}

.asset-image-item__thumb :deep(.n-image img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.asset-image-item__body {
  padding: 10px 12px;
}
</style>
