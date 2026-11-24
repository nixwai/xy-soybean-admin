<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import { createMenuColumns } from './utils/menu-columns';
import { buildMenuTree } from './utils/menu-tree';
import { useMenuQuery } from './hooks/use-menu-query';
import { useMenuStatus } from './hooks/use-menu-status';
import MenuFormModal from './components/menu-form-modal.vue';
import MenuSearchForm from './components/menu-search-form.vue';

const { loading, filteredItems, query, load, search, reset } = useMenuQuery();
const expandedRowKeys = ref<string[]>([]);
const { pendingId, toggle: toggleStatus } = useMenuStatus({ onSuccess: load });
const formModalRef = ref<InstanceType<typeof MenuFormModal> | null>(null);

const menuTree = computed(() => buildMenuTree(filteredItems.value));
function expandFilteredRows() {
  expandedRowKeys.value = menuTree.value.map(item => item.menuKey);
}

function handleSearch() {
  search();
  expandFilteredRows();
}

function handleReset() {
  reset();
  expandFilteredRows();
}

const columns = computed(() =>
  createMenuColumns({
    pendingStatusId: pendingId,
    onEdit: row => formModalRef.value?.openEdit(row),
    onToggleStatus: toggleStatus
  })
);

async function refresh() {
  await load();
  expandedRowKeys.value = menuTree.value.map(item => item.menuKey);
}

onMounted(refresh);
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <MenuSearchForm v-model:query="query" :loading="loading" @search="handleSearch" @reset="handleReset" />
    </NCard>

    <NCard title="菜单管理" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="8">
          <NButton size="small" :loading="loading" @click="refresh">刷新</NButton>
        </NSpace>
      </template>
      <NDataTable
        v-model:expanded-row-keys="expandedRowKeys"
        size="small"
        :columns="columns"
        :data="menuTree"
        :loading="loading"
        :pagination="false"
        :scroll-x="1450"
        :row-key="row => row.menuKey"
      />
      <MenuFormModal ref="formModalRef" @success="load" />
    </NCard>
  </NSpace>
</template>
