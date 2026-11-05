<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import { createRoleColumns } from './utils/role-columns';
import { useRoleDelete } from './hooks/use-role-delete';
import { useRoleFormSubmit } from './hooks/use-role-form-submit';
import { useRolePermissionAssign } from './hooks/use-role-permission-assign';
import { useRoleQuery } from './hooks/use-role-query';
import { useRoleStatus } from './hooks/use-role-status';
import RoleFormModal from './components/role-form-modal.vue';
import RolePermissionModal from './components/role-permission-modal.vue';

const { loading, items, total, page, pageSize, load, changePage, changePageSize } = useRoleQuery();
const { permissionLoading, permissionGroups, permissions, loadPermissionCatalog } = usePermissionCatalog();
const {
  showModal: formModalVisible,
  submitting: formSubmitting,
  editing,
  form: roleForm,
  openCreate,
  openEdit,
  submit: submitRoleForm
} = useRoleFormSubmit({ onSuccess: load });
const {
  showModal: permissionModalVisible,
  submitting: permissionSubmitting,
  target: permissionTarget,
  form: permissionForm,
  unmanagedPermissionIds,
  permissionChanges,
  open: openPermissionAssign,
  submit: submitPermissionAssign
} = useRolePermissionAssign({ onSuccess: load });
const { pendingId, toggle: toggleStatus } = useRoleStatus({ onSuccess: load });
const { remove: deleteRole } = useRoleDelete({ onSuccess: load });

/** 打开权限分配弹窗，并以可分配目录界定本次可调整的权限范围。 */
function handlePermissionAssign(row: ApiManagement.Role) {
  openPermissionAssign(
    row,
    permissions.value.map(item => item.id)
  );
}
const columns = computed(() =>
  createRoleColumns({
    pendingStatusId: pendingId,
    onEdit: openEdit,
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
        <NButton size="small" type="primary" @click="openCreate">新增角色</NButton>
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
    <RoleFormModal
      v-model:show="formModalVisible"
      v-model:form="roleForm"
      :editing="editing"
      :submitting="formSubmitting"
      @submit="submitRoleForm"
    />
    <RolePermissionModal
      v-model:show="permissionModalVisible"
      v-model:form="permissionForm"
      :target="permissionTarget"
      :groups="permissionGroups"
      :changes="permissionChanges"
      :unmanaged-permission-ids="unmanagedPermissionIds"
      :loading="permissionLoading"
      :submitting="permissionSubmitting"
      @submit="submitPermissionAssign"
    />
  </NCard>
</template>
