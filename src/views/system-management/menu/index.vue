<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import { createMenuColumns } from './utils/menu-columns';
import { buildMenuTree, collectMenuBranchIds, toMenuTreeOptions } from './utils/menu-tree';
import { useMenuDelete } from './hooks/use-menu-delete';
import { useMenuFormSubmit } from './hooks/use-menu-form-submit';
import { useMenuQuery } from './hooks/use-menu-query';
import { useMenuStatus } from './hooks/use-menu-status';
import MenuFormModal from './components/menu-form-modal.vue';
import type { MenuTreeNode } from './typings';

const { loading, items, load: loadMenuList } = useMenuQuery();
const expandedRowKeys = ref<string[]>([]);
const { permissionLoading, permissions, permissionByCode, loadPermissionCatalog } = usePermissionCatalog();
/** 拉取菜单列表并默认展开全部节点，保证树形数据加载后一次可见。 */
async function load() {
  await loadMenuList();
  expandedRowKeys.value = items.value.map(item => item.id);
}

const {
  showModal,
  submitting,
  editing,
  form: menuForm,
  openCreate,
  openEdit,
  submit: submitMenuForm
} = useMenuFormSubmit({ onSuccess: load });
const { pendingId, toggle: toggleStatus } = useMenuStatus({ onSuccess: load });
const { remove: deleteMenu } = useMenuDelete({ onSuccess: load });

/** 菜单树，供树形表格展示和父级选择复用。 */
const menuTree = computed(() => buildMenuTree(items.value));

/** 在指定菜单下新增子菜单，排序值默认排在其现有子菜单之后。 */
function handleCreateChild(row: MenuTreeNode) {
  const maxOrder = (row.children ?? []).reduce((max, child) => Math.max(max, child.order), 0);
  openCreate(maxOrder + 1, row.id);
}

const columns = computed(() =>
  createMenuColumns({
    pendingStatusId: pendingId,
    onCreateChild: handleCreateChild,
    onEdit: openEdit,
    onDelete: deleteMenu,
    onToggleStatus: toggleStatus
  })
);

/** 父级候选项，编辑时排除自身分支以避免形成循环父子关系。 */
const parentOptions = computed(() => {
  const excludedIds = editing.value ? collectMenuBranchIds(items.value, editing.value.id) : [];
  return toMenuTreeOptions(menuTree.value, excludedIds);
});

/** 可选权限编码，后端要求菜单绑定的权限必须处于启用状态。 */
const permissionOptions = computed(() =>
  permissions.value
    .filter(item => item.isActive)
    .map(item => ({ label: `${item.name}（${item.code}）`, value: item.code }))
);

/** 新增一级菜单时的默认排序值。 */
const nextRootOrder = computed(() => menuTree.value.reduce((max, node) => Math.max(max, node.order), 0) + 1);

/** 同时刷新菜单列表和权限目录。 */
async function refresh() {
  await Promise.all([load(), loadPermissionCatalog()]);
}

onMounted(refresh);
</script>

<template>
  <NCard title="菜单管理" :bordered="false" class="card-wrapper">
    <template #header-extra>
      <NSpace :size="8">
        <NButton size="small" :loading="loading" @click="refresh">刷新</NButton>
        <NButton size="small" type="primary" @click="openCreate(nextRootOrder)">新增一级菜单</NButton>
      </NSpace>
    </template>
    <NDataTable
      v-model:expanded-row-keys="expandedRowKeys"
      size="small"
      :columns="columns"
      :data="menuTree"
      :loading="loading"
      :pagination="false"
      :scroll-x="1350"
      :row-key="row => row.id"
    />
    <MenuFormModal
      v-model:show="showModal"
      v-model:form="menuForm"
      :editing="editing"
      :parent-options="parentOptions"
      :permission-options="permissionOptions"
      :permission-by-code="permissionByCode"
      :permission-loading="permissionLoading"
      :submitting="submitting"
      @submit="submitMenuForm"
    />
  </NCard>
</template>
