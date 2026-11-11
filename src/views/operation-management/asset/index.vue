<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NInput, NSpace, useMessage } from 'naive-ui';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { assetAccess, buildAssetTree, ownerLabel } from './utils/asset-policy';
import { useAssetActions } from './hooks/use-asset-actions';
import { useAssetQuery } from './hooks/use-asset-query';
import AssetFolderPanel from './components/asset-folder-panel.vue';
import AssetImageGrid from './components/asset-image-grid.vue';
import AssetUploadPanel from './components/asset-upload-panel.vue';

const message = useMessage();
const auth = useAuthStore();
const { hasAuth } = useAuth();
const access = computed(() => assetAccess(auth.userInfo.userId, hasAuth));
const query = useAssetQuery(
  () => auth.userInfo.userId,
  access,
  text => message.error(text)
);
const { scope, selection, owners, folders, assets, loading, queryError, page, pageSize, total, selectedKey } = query;
const searchText = ref('');
// 会话目前保留 /admin/me 的 username，兼容尚未映射为 userName 的存量状态。
const sessionUsername = computed(() =>
  'username' in auth.userInfo && typeof auth.userInfo.username === 'string'
    ? auth.userInfo.username
    : auth.userInfo.userName
);
const label = (id: string) => ownerLabel(id, auth.userInfo.userId, sessionUsername.value, owners.value);
const tree = computed(() =>
  buildAssetTree(
    scope.value,
    auth.userInfo.userId,
    owners.value.map(owner => ({ ...owner, username: label(owner.id) })),
    folders.value,
    access.value
  )
);
// 自己不需要 owners 权限；全量模式其他用户必须来自受授权接口，不猜测停用状态。
const isActive = (id: string) => owners.value.find(owner => owner.id === id)?.isActive ?? id === auth.userInfo.userId;
const activeOwner = computed(() => Boolean(selection.value.ownerId && isActive(selection.value.ownerId)));
const canUpload = (id: string, folderId: string | null) =>
  isActive(id) && access.value.write('image', 'upload', id) && access.value.target(id, folderId);
const actions = useAssetActions(
  access,
  isActive,
  query.refresh,
  text => message.success(text),
  text => message.error(text)
);

onMounted(() => {
  void query.loadOwners();
  void query.refresh();
});
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px overflow-auto">
    <AssetFolderPanel
      :scope="scope"
      :tree="tree"
      :selected-key="selectedKey"
      :selection="selection"
      :folders="folders"
      :access="access"
      :active-owner="activeOwner"
      :create-allowed="hasAuth('asset.folder.create')"
      :actions="actions"
      @scope="query.changeScope"
      @select="query.select"
    />
    <NCard class="min-w-0 flex-1" :bordered="false" title="图片素材">
      <template #header-extra>
        <NSpace align="center">
          <NInput
            v-model:value="searchText"
            clearable
            placeholder="搜索图片名称"
            :maxlength="128"
            @keyup.enter="query.search(searchText)"
            @clear="query.search('')"
          />
          <NButton secondary @click="query.search(searchText)">搜索</NButton>
          <NButton
            @click="
              () => {
                query.loadOwners();
                query.refresh();
              }
            "
          >
            刷新
          </NButton>
        </NSpace>
      </template>
      <AssetUploadPanel
        v-if="hasAuth('asset.image.upload')"
        :owner-id="selection.ownerId"
        :folder-id="selection.folderId"
        :allowed="canUpload"
        @changed="query.refresh"
      />
      <AssetImageGrid
        :assets="assets"
        :folders="folders"
        :access="access"
        :actions="actions"
        :loading="loading"
        :error="queryError"
        :page="page"
        :page-size="pageSize"
        :total="total"
        :label="label"
        @page="query.changePage"
      />
    </NCard>
  </div>
</template>
