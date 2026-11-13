<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { useAuthStore } from '@/store/modules/auth';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { useRoleOptions } from '../hooks/use-role-options';
import { createAdminColumns } from './utils/admin-columns';
import { useAdminQuery } from './hooks/use-admin-query';
import { useAdminStatus } from './hooks/use-admin-status';
import AdminDeleteModal from './components/admin-delete-modal.vue';
import AdminFormModal from './components/admin-form-modal.vue';
import AdminPasswordModal from './components/admin-password-modal.vue';
import AdminRoleModal from './components/admin-role-modal.vue';

const authStore = useAuthStore();
const { loading, items, total, page, pageSize, load, changePage, changePageSize } = useAdminQuery();
const { roleLoading, roles, roleNameMap, loadRoles } = useRoleOptions();
const { pendingId, toggle: toggleStatus } = useAdminStatus({ onSuccess: load });

const formModalRef = ref<InstanceType<typeof AdminFormModal> | null>(null);
const roleModalRef = ref<InstanceType<typeof AdminRoleModal> | null>(null);
const passwordModalRef = ref<InstanceType<typeof AdminPasswordModal> | null>(null);
const deleteModalRef = ref<InstanceType<typeof AdminDeleteModal> | null>(null);

const columns = computed(() =>
  createAdminColumns({
    roleNameMap,
    currentAdminId: authStore.userInfo.userId,
    pendingStatusId: pendingId,
    onEdit: row => formModalRef.value?.openEdit(row),
    onRoleAssign: row => roleModalRef.value?.open(row),
    onPassword: row => passwordModalRef.value?.open(row),
    onDelete: row => deleteModalRef.value?.open(row),
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

/** 同时刷新管理员列表和角色选项，保证角色名称展示与最新数据一致。 */
async function refresh() {
  await Promise.all([load(), loadRoles()]);
}

onMounted(refresh);
</script>

<template>
  <NCard title="管理员管理" :bordered="false" class="card-wrapper">
    <template #header-extra>
      <NSpace :size="8">
        <NButton size="small" :loading="loading" @click="refresh">刷新</NButton>
        <NButton size="small" type="primary" @click="formModalRef?.openCreate()">新增管理员</NButton>
      </NSpace>
    </template>
    <NDataTable
      remote
      size="small"
      :columns="columns"
      :data="items"
      :loading="loading"
      :pagination="pagination"
      :scroll-x="1180"
      :row-key="row => row.id"
    />
    <AdminFormModal ref="formModalRef" @success="load" />
    <AdminRoleModal ref="roleModalRef" :roles="roles" :roles-loading="roleLoading" @success="load" />
    <AdminPasswordModal ref="passwordModalRef" @success="load" />
    <AdminDeleteModal ref="deleteModalRef" @success="load" />
  </NCard>
</template>
