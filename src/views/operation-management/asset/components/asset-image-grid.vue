<script setup lang="ts">
import { NButton, NCard, NEmpty, NImage, NImageGroup, NPagination, NPopconfirm, NSelect, NSpin } from 'naive-ui';
import type { useAssetActions } from '../hooks/use-asset-actions';
import type { AssetAccess } from '../typings';

const props = defineProps<{
  assets: ApiManagement.Asset[];
  folders: ApiManagement.AssetFolder[];
  access: AssetAccess;
  actions: ReturnType<typeof useAssetActions>;
  loading: boolean;
  error: string;
  page: number;
  pageSize: number;
  total: number;
  label: (id: string) => string;
}>();
defineEmits<{ page: [value: number] }>();
function folderOptions(ownerId: string) {
  return [
    { label: '未分类', value: '' },
    ...props.folders
      .filter(folder => folder.ownerId === ownerId && props.access.read('folder', ownerId))
      .map(folder => ({ label: folder.name, value: folder.id }))
  ];
}
</script>

<template>
  <NSpin :show="loading">
    <NEmpty v-if="error" :description="error" class="py-40px" />
    <NImageGroup v-else>
      <div v-if="assets.length" class="grid grid-cols-3 gap-12px xl:grid-cols-4 2xl:grid-cols-5">
        <NCard v-for="asset in assets" :key="asset.id" size="small" :title="asset.originalName">
          <NImage :src="asset.url" :alt="asset.originalName" height="150" class="w-full" object-fit="contain" />
          <div class="mt-8px text-12px text-gray">上传人：{{ label(asset.createdByAdminId) }}</div>
          <div class="mb-8px text-12px text-gray">归属人：{{ label(asset.ownerId) }}</div>
          <div class="flex items-center gap-8px">
            <NSelect
              v-if="access.write('image', 'move', asset.ownerId)"
              class="min-w-0 flex-1"
              size="small"
              :value="asset.folderId || ''"
              :options="folderOptions(asset.ownerId)"
              :disabled="actions.busy.value"
              placeholder="移动至"
              :aria-label="`移动 ${asset.originalName}`"
              @update:value="value => actions.move(asset, value || null)"
            />
            <NPopconfirm
              v-if="access.write('image', 'delete', asset.ownerId)"
              @positive-click="actions.removeImage(asset)"
            >
              <template #trigger>
                <NButton size="small" type="error" quaternary :disabled="actions.busy.value">删除</NButton>
              </template>
              确认删除这张图片？
            </NPopconfirm>
          </div>
        </NCard>
      </div>
      <NEmpty v-else-if="!loading" description="暂无可查看的图片，请选择有权限的归属用户或目录" class="py-80px" />
    </NImageGroup>
  </NSpin>
  <div class="mt-16px flex justify-end">
    <NPagination :page="page" :page-size="pageSize" :item-count="total" @update:page="$emit('page', $event)" />
  </div>
</template>
