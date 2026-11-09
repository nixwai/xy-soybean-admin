<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import {
  NButton,
  NCard,
  NEmpty,
  NIcon,
  NInput,
  NPagination,
  NPopconfirm,
  NSelect,
  NSpace,
  NTree,
  NUpload,
  NUploadDragger,
  useMessage
} from 'naive-ui';
import type { TreeOption } from 'naive-ui';
import {
  createAssetFolder,
  deleteAsset,
  deleteAssetFolder,
  fetchAssetFolders,
  fetchAssets,
  moveAsset,
  uploadAssets
} from '@/service/api';
import { useAuth } from '@/hooks/business/auth';

const message = useMessage();
const { hasAuth } = useAuth();
const canCreateFolder = computed(() => hasAuth('asset.folder.create'));
const canDeleteFolder = computed(() => hasAuth('asset.folder.delete'));
const canUpload = computed(() => hasAuth('asset.image.upload'));
const canMove = computed(() => hasAuth('asset.image.move'));
const canDeleteImage = computed(() => hasAuth('asset.image.delete'));
const canReadAll = computed(() => hasAuth('asset.image.read-all'));
const folders = ref<ApiManagement.AssetFolder[]>([]);
const assets = ref<ApiManagement.Asset[]>([]);
const loading = ref(false);
const uploading = ref(false);
const selectedFolderId = ref<string | null>(null);
const keyword = ref('');
const folderName = ref('');
const page = ref(1);
const pageSize = ref(24);
const total = ref(0);
const fileInput = ref<HTMLInputElement>();

const folderOptions = computed(() => [
  { label: '未分类', value: '' },
  ...folders.value.map(folder => ({ label: folder.name, value: folder.id }))
]);
const treeData = computed<TreeOption[]>(() => {
  const build = (parentId: string | null): TreeOption[] =>
    folders.value
      .filter(item => item.parentId === parentId)
      .map(item => ({
        key: item.id,
        label: `${item.name} (${item.imageCount})`,
        children: build(item.id),
        prefix: () => h(NIcon, null, { default: () => '▣' })
      }));
  return [
    { key: 'root', label: '全部素材', children: build(null), prefix: () => h(NIcon, null, { default: () => '▣' }) }
  ];
});

async function loadFolders() {
  const { data } = await fetchAssetFolders();
  folders.value = data?.items ?? [];
}
async function loadAssets() {
  loading.value = true;
  const { data } = await fetchAssets({
    page: page.value,
    pageSize: pageSize.value,
    folderId: selectedFolderId.value ?? undefined,
    keyword: keyword.value || undefined
  });
  assets.value = data?.items ?? [];
  total.value = data?.total ?? 0;
  loading.value = false;
}
async function refresh() {
  await Promise.all([loadFolders(), loadAssets()]);
}
function handleFolderSelect(keys: Array<string | number>) {
  selectedFolderId.value = keys[0] && keys[0] !== 'root' ? String(keys[0]) : null;
  page.value = 1;
  void loadAssets();
}
async function addFolder() {
  const name = folderName.value.trim();
  if (!name) return message.warning('请输入文件夹名称');
  await createAssetFolder({ name, parentId: selectedFolderId.value });
  folderName.value = '';
  await loadFolders();
  message.success('文件夹已创建');
}
async function removeFolder(id: string) {
  await deleteAssetFolder(id);
  if (selectedFolderId.value === id) selectedFolderId.value = null;
  await refresh();
  message.success('文件夹已删除');
}
async function handleUpload(fileList: File[]) {
  if (!fileList.length || !canUpload.value) return;
  uploading.value = true;
  const { data } = await uploadAssets(fileList, selectedFolderId.value);
  uploading.value = false;
  if (data?.successCount) message.success(`成功上传 ${data.successCount} 张图片`);
  if (data?.failed?.length) message.warning(`${data.failed.length} 张图片上传失败`);
  await refresh();
}
function handlePaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []).filter(file => file.type.startsWith('image/'));
  if (files.length) {
    event.preventDefault();
    void handleUpload(files);
  }
}
function handleChooseFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? []);
  void handleUpload(files);
  (event.target as HTMLInputElement).value = '';
}
async function handleMove(asset: ApiManagement.Asset, folderId: string) {
  await moveAsset(asset.id, folderId || null);
  assets.value = assets.value.map(item => (item.id === asset.id ? { ...item, folderId: folderId || null } : item));
  message.success('图片已移动');
}
async function removeAsset(id: string) {
  await deleteAsset(id);
  assets.value = assets.value.filter(asset => asset.id !== id);
  message.success('图片已删除');
}
function changePage(value: number) {
  page.value = value;
  void loadAssets();
}
useEventListener('paste', handlePaste);
onMounted(refresh);
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px">
    <NCard class="w-280px shrink-0" :bordered="false" title="素材文件夹">
      <template #header-extra>
        <NButton v-if="canCreateFolder" quaternary circle size="small" @click="addFolder">＋</NButton>
      </template>
      <NSpace vertical :size="12">
        <NInput
          v-if="canCreateFolder"
          v-model:value="folderName"
          placeholder="新建文件夹名称"
          clearable
          @keyup.enter="addFolder"
        />
        <NTree
          block-line
          selectable
          :data="treeData"
          :selected-keys="selectedFolderId ? [selectedFolderId] : ['root']"
          @update:selected-keys="handleFolderSelect"
        />
        <NEmpty v-if="folders.length === 0" description="暂无自定义文件夹" />
        <NPopconfirm v-if="selectedFolderId && canDeleteFolder" @positive-click="removeFolder(selectedFolderId)">
          <template #trigger><NButton tertiary type="error" block>删除当前文件夹</NButton></template>
          删除文件夹后，图片会移动到未分类，确认删除？
        </NPopconfirm>
      </NSpace>
    </NCard>
    <NCard class="min-w-0 flex-1" :bordered="false" title="图片素材">
      <template #header-extra>
        <NSpace align="center">
          <NSelect
            v-if="canReadAll"
            v-model:value="selectedFolderId"
            :options="folderOptions"
            class="w-150px"
            @update:value="
              () => {
                page = 1;
                loadAssets();
              }
            "
          />
          <NInput v-model:value="keyword" clearable placeholder="搜索图片名称" @keyup.enter="loadAssets" />
          <NButton secondary @click="loadAssets">搜索</NButton>
          <NButton v-if="canUpload" type="primary" :loading="uploading" @click="fileInput?.click()">上传图片</NButton>
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="handleChooseFiles" />
        </NSpace>
      </template>
      <NUpload
        v-if="canUpload"
        :show-file-list="false"
        accept="image/*"
        multiple
        :custom-request="({ file }) => handleUpload([file.file as globalThis.File])"
      >
        <NUploadDragger class="mb-16px">
          <div class="py-12px">
            <NIcon size="32" color="#18a058">↑</NIcon>
            <div class="mt-8px text-14px">拖拽图片到这里，或点击上传</div>
            <div class="mt-4px text-12px text-gray-400">支持批量上传；也可以直接复制图片后粘贴到本页面</div>
          </div>
        </NUploadDragger>
      </NUpload>
      <div v-if="assets.length" class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-16px">
        <NCard v-for="asset in assets" :key="asset.id" size="small" content-style="padding: 0" class="overflow-hidden">
          <div class="h-160px bg-gray-100 flex items-center justify-center">
            <img :src="asset.url" :alt="asset.originalName" class="h-full w-full object-contain" />
          </div>
          <div class="p-10px">
            <div class="truncate text-13px" :title="asset.originalName">{{ asset.originalName }}</div>
            <NSelect
              v-if="canMove"
              :value="asset.folderId ?? ''"
              :options="folderOptions"
              size="small"
              class="mt-8px"
              @update:value="value => handleMove(asset, value)"
            />
            <div v-if="canDeleteImage" class="mt-6px flex justify-end">
              <NPopconfirm @positive-click="removeAsset(asset.id)">
                <template #trigger><NButton quaternary circle size="small" type="error">×</NButton></template>
                确认删除这张图片？
              </NPopconfirm>
            </div>
          </div>
        </NCard>
      </div>
      <NEmpty v-else-if="!loading" description="暂无图片素材" class="py-80px">
        <template #icon><NIcon size="48">▧</NIcon></template>
      </NEmpty>
      <div class="mt-16px flex justify-end">
        <NPagination :page="page" :page-size="pageSize" :item-count="total" @update:page="changePage" />
      </div>
    </NCard>
  </div>
</template>
