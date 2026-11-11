<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NCard, NInput, NModal, NPopconfirm, NSelect, NSpace, NTree } from 'naive-ui';
import type { TreeOption } from 'naive-ui';
import type { useAssetActions } from '../hooks/use-asset-actions';
import type { AssetAccess, AssetSelection } from '../typings';

const props = defineProps<{
  scope: 'mine' | 'all';
  tree: TreeOption[];
  selectedKey: string;
  selection: AssetSelection;
  folders: ApiManagement.AssetFolder[];
  access: AssetAccess;
  activeOwner: boolean;
  createAllowed: boolean;
  actions: ReturnType<typeof useAssetActions>;
}>();
const emit = defineEmits<{ scope: [value: 'mine' | 'all']; select: [key: string] }>();
const folderName = ref('');
const renameName = ref('');
const renameTarget = ref<ApiManagement.AssetFolder | null>(null);
const selectedFolder = computed(() => props.folders.find(folder => folder.id === props.selection.folderId));
const createDisabled = computed(
  () =>
    !props.selection.ownerId || !props.activeOwner || !props.access.write('folder', 'create', props.selection.ownerId)
);
const scopeOptions = [
  { label: '我的素材', value: 'mine' },
  { label: '全部素材', value: 'all' }
];

async function createFolder() {
  if (await props.actions.create(folderName.value, props.selection)) folderName.value = '';
}
function openRename() {
  if (!selectedFolder.value) return;
  renameTarget.value = { ...selectedFolder.value };
  renameName.value = selectedFolder.value.name;
}
async function submitRename() {
  if (renameTarget.value && (await props.actions.rename(renameTarget.value, renameName.value)))
    renameTarget.value = null;
}
</script>

<template>
  <NCard class="w-280px shrink-0" :bordered="false" title="素材文件夹">
    <NSpace vertical :size="12">
      <NSelect
        v-if="access.showAll"
        :value="scope"
        :options="scopeOptions"
        aria-label="素材范围"
        @update:value="emit('scope', $event)"
      />
      <NTree
        block-line
        selectable
        :data="tree"
        :selected-keys="[selectedKey]"
        @update:selected-keys="keys => emit('select', String(keys[0] ?? selectedKey))"
      />
      <template v-if="createAllowed">
        <NInput
          v-model:value="folderName"
          :maxlength="128"
          :disabled="createDisabled || actions.busy.value"
          placeholder="新建文件夹名称"
          @keyup.enter="createFolder"
        />
        <NButton block :disabled="createDisabled || !folderName.trim() || actions.busy.value" @click="createFolder">
          新建文件夹
        </NButton>
      </template>
      <p v-if="scope === 'all' && !selection.ownerId" class="text-12px text-gray">请选择归属用户后新增素材</p>
      <p v-if="selection.ownerId && !activeOwner" class="text-12px text-warning">
        该归属用户已停用，禁止新增素材，历史素材仍可管理
      </p>
      <template v-if="selectedFolder">
        <div class="text-12px text-gray">当前目录：{{ selectedFolder.name }}</div>
        <NButton
          v-if="access.write('folder', 'update', selectedFolder.ownerId)"
          block
          :disabled="actions.busy.value"
          @click="openRename"
        >
          重命名
        </NButton>
        <NPopconfirm
          v-if="access.write('folder', 'delete', selectedFolder.ownerId)"
          @positive-click="actions.removeFolder(selectedFolder)"
        >
          <template #trigger>
            <NButton block type="error" secondary :disabled="actions.busy.value">删除当前目录树</NButton>
          </template>
          当前文件夹及全部子文件夹将被软删除，其中图片不会被删除，而是移至该用户未分类。确认删除？
        </NPopconfirm>
      </template>
    </NSpace>
    <NModal
      :show="Boolean(renameTarget)"
      preset="card"
      title="重命名文件夹"
      class="w-420px"
      @update:show="
        value => {
          if (!value) renameTarget = null;
        }
      "
    >
      <NSpace vertical>
        <NInput v-model:value="renameName" :maxlength="128" placeholder="文件夹名称" @keyup.enter="submitRename" />
        <NButton type="primary" :loading="actions.busy.value" :disabled="!renameName.trim()" @click="submitRename">
          保存
        </NButton>
      </NSpace>
    </NModal>
  </NCard>
</template>
