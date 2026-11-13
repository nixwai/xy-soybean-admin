<script setup lang="ts">
import { onMounted } from 'vue';
import { NCard, NDropdown, NEmpty, NSpace, NSpin, NSwitch, NTree } from 'naive-ui';
import { useAssetFolderContextMenu } from './hooks/use-asset-folder-context-menu';
import { useAssetFolderDelete } from './hooks/use-asset-folder-delete';
import { useAssetFolderFormSubmit } from './hooks/use-asset-folder-form-submit';
import { useAssetFolderTree } from './hooks/use-asset-folder-tree';
import FolderDeleteModal from './components/folder-delete-modal.vue';
import FolderFormModal from './components/folder-form-modal.vue';

const { canViewAll, changeScope, expandedKeys, loadTree, loading, scopeAll, selectedKeys, selectedNode, treeData } =
  useAssetFolderTree();
const { closeContextMenu, contextMenu, contextOptions, contextTarget, nodeProps } = useAssetFolderContextMenu();
const {
  showModal: showFormModal,
  submitting: formSubmitting,
  mode: formMode,
  form: folderForm,
  parentLabel,
  openCreate,
  openRename,
  submit: submitFolderForm
} = useAssetFolderFormSubmit({ onSuccess: loadTree });
const {
  showModal: showDeleteModal,
  submitting: deleteSubmitting,
  target: deleteTarget,
  open: openDelete,
  submit: submitFolderDelete
} = useAssetFolderDelete({ onSuccess: loadTree });

/** 右键菜单动作分派，节点是否可操作由各动作流程判断。 */
function handleContextMenuSelect(key: string | number) {
  closeContextMenu();
  const target = contextTarget.value;
  if (!target) return;
  if (key === 'create') openCreate(target);
  else if (key === 'rename') openRename(target);
  else if (key === 'delete') openDelete(target);
}

onMounted(() => void loadTree());
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px">
    <NCard class="w-320px shrink-0" :bordered="false" title="素材文件夹">
      <template #header-extra>
        <NSpace align="center" :size="6">
          <span class="text-12px text-#999">仅自己</span>
          <NSwitch
            :value="scopeAll"
            :disabled="!canViewAll"
            size="small"
            aria-label="素材查看范围"
            @update:value="changeScope"
          />
          <span class="text-12px text-#999">查看所有</span>
        </NSpace>
      </template>
      <NSpin :show="loading">
        <NTree
          v-if="treeData.length"
          v-model:selected-keys="selectedKeys"
          v-model:expanded-keys="expandedKeys"
          block-line
          selectable
          :data="treeData"
          :node-props="nodeProps"
          class="min-h-420px"
        />
        <NEmpty v-else description="暂无素材文件夹" class="py-40px" />
      </NSpin>
    </NCard>

    <NCard class="min-w-0 flex-1" :bordered="false" title="素材内容">
      <div class="h-full min-h-420px" aria-label="素材内容预留区域">
        <NEmpty v-if="selectedNode?.nodeType === 'folder'" description="该文件夹暂未添加素材内容" class="pt-80px" />
      </div>
    </NCard>

    <NDropdown
      placement="bottom-start"
      trigger="manual"
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :options="contextOptions"
      @select="handleContextMenuSelect"
      @clickoutside="closeContextMenu"
    />

    <FolderFormModal
      v-model:show="showFormModal"
      v-model:form="folderForm"
      :mode="formMode"
      :submitting="formSubmitting"
      :parent-label="parentLabel"
      @submit="submitFolderForm"
    />
    <FolderDeleteModal
      v-model:show="showDeleteModal"
      :folder-name="deleteTarget?.label ?? ''"
      :submitting="deleteSubmitting"
      @submit="submitFolderDelete"
    />
  </div>
</template>
