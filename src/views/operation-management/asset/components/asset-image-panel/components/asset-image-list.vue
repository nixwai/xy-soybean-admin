<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { NAlert, NDropdown, NEmpty, NImage, NPagination, NSpin, NTag } from 'naive-ui';
import { useAssetContextStore } from '@/views/operation-management/asset/store';
import type { AssetImageAction, AssetImageQueryContext } from '@/views/operation-management/asset/typings';
import { formatAssetImageSize, formatAssetImageType } from '../utils/asset-image';
import { useAssetImageStore } from '../store/asset-image-store';
import { useAssetImageAccess } from '../hooks/use-asset-image-access';
import { useAssetImageContextMenu } from '../hooks/use-asset-image-context-menu';

defineOptions({ name: 'AssetImageList' });

const emit = defineEmits<{
  action: [action: AssetImageAction, item: ApiManagement.AssetImage];
}>();

const { selectedNode, scopeAll } = storeToRefs(useAssetContextStore());
const imageStore = useAssetImageStore();
const { items, keyword, loading, page, pageSize, refreshKey, selectedImage, total } = storeToRefs(imageStore);
const { canRead, getImageActions } = useAssetImageAccess();
const loadError = ref(false);
const {
  target: menuTarget,
  position: menuPosition,
  options: menuOptions,
  open: openMenu,
  close: closeMenu,
  takeAction
} = useAssetImageContextMenu(getImageActions);
/** 关键词非空即进入搜索态，此时结果不再局限于当前文件夹的直属图片。 */
const isSearching = computed(() => Boolean(keyword.value));
/** 搜索态下的范围说明，避免用户误判结果来源。 */
const searchScopeLabel = computed(() => {
  if (!isSearching.value) return '';
  if (selectedNode.value?.nodeType === 'folder') return '含子文件夹';
  if (selectedNode.value?.nodeType === 'owner') return `${selectedNode.value.label} 全部文件夹`;
  return scopeAll.value ? '全部账号素材' : '个人素材';
});

/** 查询当前上下文对应的图片，并将请求失败转换为列表展示状态。 */
async function reload(targetPage = page.value) {
  closeMenu();
  loadError.value = false;
  const context: AssetImageQueryContext = canRead.value
    ? { node: selectedNode.value, scopeAll: scopeAll.value, keyword: keyword.value }
    : { node: null, scopeAll: false, keyword: '' };
  const success = await imageStore.load(context, targetPage);
  loadError.value = !success;
  return success;
}

/** 切换图片分页。 */
async function handlePageChange(value: number) {
  await reload(value);
}

function handleSelect(item: ApiManagement.AssetImage) {
  closeMenu();
  imageStore.select(item);
}

/** 键盘打开时将菜单定位在卡片下方。 */
function handleOpenMenu(event: MouseEvent | KeyboardEvent, item: ApiManagement.AssetImage) {
  if (loading.value || !canRead.value) return;
  if (!(event.currentTarget instanceof HTMLButtonElement)) return;
  const card = event.currentTarget;
  if (event instanceof MouseEvent && (event.clientX || event.clientY)) {
    card.focus({ preventScroll: true });
    openMenu(item, { x: event.clientX, y: event.clientY });
  } else {
    const { left, bottom } = card.getBoundingClientRect();
    openMenu(item, { x: left, y: bottom });
  }
}

function handleMenuSelect(key: string | number) {
  const choice = takeAction(key);
  if (choice) emit('action', choice.action, choice.item);
}

watch(
  [() => selectedNode.value?.key, scopeAll, keyword, canRead, refreshKey],
  () => {
    void reload(1);
  },
  { immediate: true }
);

onUnmounted(imageStore.clearQuery);
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
          'asset-image-item--selected': selectedImage?.id === item.id
        }"
        :aria-label="`查看 ${item.originalName}`"
        aria-haspopup="menu"
        :aria-expanded="menuTarget?.id === item.id"
        @click="handleSelect(item)"
        @contextmenu.prevent="handleOpenMenu($event, item)"
        @keydown.shift.f10.prevent="handleOpenMenu($event, item)"
        @keydown.context-menu.prevent="handleOpenMenu($event, item)"
      >
        <div class="asset-image-item__thumb">
          <NImage
            :src="item.url"
            :alt="item.originalName"
            :preview-disabled="true"
            object-fit="contain"
            width="100%"
            height="100%"
          />
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
  <NDropdown
    trigger="manual"
    placement="bottom-start"
    :show="Boolean(menuTarget)"
    :x="menuPosition.x"
    :y="menuPosition.y"
    :options="menuOptions"
    @select="handleMenuSelect"
    @clickoutside="closeMenu"
    @update:show="visible => !visible && closeMenu()"
  />
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
