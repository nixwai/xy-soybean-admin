<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NDropdown, NEmpty, NSpace, NSpin, NSwitch, NTree } from 'naive-ui';
import { useAssetFolderContextMenu } from './hooks/use-asset-folder-context-menu';
import { useAssetFolderTree } from './hooks/use-asset-folder-tree';
import FolderDeleteModal from './components/folder-delete-modal.vue';
import FolderFormModal from './components/folder-form-modal.vue';

const {
  canCreateTopLevel,
  canViewAll,
  changeScope,
  expandedKeys,
  loadTree,
  loading,
  personalOwnerNode,
  scopeAll,
  selectedKeys,
  selectedNode,
  treeData
} = useAssetFolderTree();
const { closeContextMenu, contextMenu, contextOptions, contextTarget, nodeProps } = useAssetFolderContextMenu();

const formModalRef = ref<InstanceType<typeof FolderFormModal> | null>(null);
const deleteModalRef = ref<InstanceType<typeof FolderDeleteModal> | null>(null);

/** 右键菜单动作分派，节点是否可操作由各动作流程判断。 */
function handleContextMenuSelect(key: string | number) {
  closeContextMenu();
  const target = contextTarget.value;
  if (!target) return;
  if (key === 'create') formModalRef.value?.openCreate(target);
  else if (key === 'rename') formModalRef.value?.openRename(target);
  else if (key === 'delete') deleteModalRef.value?.open(target);
}

/** 顶层新建入口：全部视图手动指定拥有者，个人视图默认当前账号。 */
function handleCreateTopLevel() {
  if (scopeAll.value) formModalRef.value?.openGlobalCreate();
  else formModalRef.value?.openCreate(personalOwnerNode.value);
}

onMounted(() => void loadTree());
</script>

<template>
  <div class="h-full min-h-520px flex gap-16px">
    <NCard class="w-320px shrink-0" :bordered="false" title="素材文件夹">
      <template #header-extra>
        <NSpace align="center" :size="6">
          <NSwitch
            :value="scopeAll"
            :disabled="!canViewAll"
            :rail-style="() => ({ minWidth: '72px' })"
            size="small"
            aria-label="素材查看范围"
            @update:value="changeScope"
          >
            <template #checked>全部</template>
            <template #unchecked>个人</template>
          </NSwitch>
          <NButton
            v-if="canCreateTopLevel"
            quaternary
            circle
            size="small"
            :title="scopeAll ? '为指定管理员新建文件夹' : '新建顶层文件夹'"
            :aria-label="scopeAll ? '为指定管理员新建文件夹' : '新建顶层文件夹'"
            @click="handleCreateTopLevel"
          >
            <template #icon>
              <icon-ic-round-plus class="text-icon" />
            </template>
          </NButton>
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

    <FolderFormModal ref="formModalRef" @success="loadTree" />
    <FolderDeleteModal ref="deleteModalRef" @success="loadTree" />
  </div>
</template>
