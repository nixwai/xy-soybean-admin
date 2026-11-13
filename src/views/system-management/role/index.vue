<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import { createRoleColumns } from './utils/role-columns';
import { useRoleDelete } from './hooks/use-role-delete';
import { useRoleQuery } from './hooks/use-role-query';
import { useRoleStatus } from './hooks/use-role-status';
import RoleFormModal from './components/role-form-modal.vue';
import RolePermissionModal from './components/role-permission-modal.vue';

const { loading, items, total, page, pageSize, load, changePage, changePageSize } = useRoleQuery();
const { permissionLoading, permissionGroups, loadPermissionCatalog } = usePermissionCatalog();
const { pendingId, toggle: toggleStatus } = useRoleStatus({ onSuccess: load });
const { remove: deleteRole } = useRoleDelete({ onSuccess: load });
const formModalRef = ref<InstanceType<typeof RoleFormModal> | null>(null);
const permissionModalRef = ref<InstanceType<typeof RolePermissionModal> | null>(null);

/** 打开权限分配弹窗，并以当前可分配权限目录作为调整范围。 */
function handlePermissionAssign(row: ApiManagement.Role) {
  permissionModalRef.value?.open(row);
}

const columns = computed(() =>
  createRoleColumns({
    pendingStatusId: pendingId,
    onEdit: row => formModalRef.value?.openEdit(row),
    onPermissionAssign: handlePermissionAssign,
    onDelete: deleteRole,
    onToggleStatus: toggleStatus
  })
);

const pagination = computed<PaginationProps>(() => ({
  page: page.value,
  pageSize: pageSize.value,
  itemCount: total.value,
  pageSizes: PAGE_SIZE_OPTIONS,
  showSizePicker: true,
  prefix: ({ itemCount }) => `共 ${itemCount} 条`,
  onChange: changePage,
  onUpdatePageSize: changePageSize
}));

/** 同时刷新角色列表和可分配权限目录。 */
async function refresh() {
  await Promise.all([load(), loadPermissionCatalog(true)]);
}

onMounted(refresh);
</script>

<template>
  <NCard title="角色管理" :bordered="false" class="card-wrapper">
    <template #header-extra>
      <NSpace :size="8">
        <NButton size="small" :loading="loading" @click="refresh">刷新</NButton>
        <NButton size="small" type="primary" @click="formModalRef?.openCreate()">新增角色</NButton>
      </NSpace>
    </template>
    <NDataTable
      remote
      size="small"
      :columns="columns"
      :data="items"
      :loading="loading"
      :pagination="pagination"
      :scroll-x="1120"
      :row-key="row => row.id"
    />
    <RoleFormModal ref="formModalRef" @success="load" />
    <RolePermissionModal
      ref="permissionModalRef"
      :groups="permissionGroups"
      :loading="permissionLoading"
      @success="load"
    />
  </NCard>
</template>
