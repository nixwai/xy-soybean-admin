<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { useAuthStore } from '@/store/modules/auth';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { useRoleOptions } from '../hooks/use-role-options';
import { createAdminColumns } from './utils/admin-columns';
import { useAdminDelete } from './hooks/use-admin-delete';
import { useAdminFormSubmit } from './hooks/use-admin-form-submit';
import { useAdminPasswordReset } from './hooks/use-admin-password-reset';
import { useAdminQuery } from './hooks/use-admin-query';
import { useAdminRoleAssign } from './hooks/use-admin-role-assign';
import { useAdminStatus } from './hooks/use-admin-status';
import AdminDeleteModal from './components/admin-delete-modal.vue';
import AdminFormModal from './components/admin-form-modal.vue';
import AdminPasswordModal from './components/admin-password-modal.vue';
import AdminRoleModal from './components/admin-role-modal.vue';

const authStore = useAuthStore();
const { loading, items, total, page, pageSize, load, changePage, changePageSize } = useAdminQuery();
const { roleLoading, roles, roleNameMap, loadRoles } = useRoleOptions();
const {
  showModal: formModalVisible,
  submitting: formSubmitting,
  editing,
  form: adminForm,
  needCurrentPassword,
  openCreate,
  openEdit,
  submit: submitAdminForm
} = useAdminFormSubmit({ onSuccess: load });
const {
  showModal: roleModalVisible,
  submitting: roleSubmitting,
  target: roleTarget,
  form: roleForm,
  roleChanges,
  open: openRoleAssign,
  submit: submitRoleAssign
} = useAdminRoleAssign({ onSuccess: load });
const {
  showModal: passwordModalVisible,
  submitting: passwordSubmitting,
  target: passwordTarget,
  form: passwordForm,
  open: openPasswordReset,
  submit: submitPasswordReset
} = useAdminPasswordReset();
const { pendingId, toggle: toggleStatus } = useAdminStatus({ onSuccess: load });
const {
  showModal: deleteModalVisible,
  submitting: deleteSubmitting,
  target: deleteTarget,
  form: deleteForm,
  open: openDelete,
  submit: submitDelete
} = useAdminDelete({ onSuccess: load });

const columns = computed(() =>
  createAdminColumns({
    roleNameMap,
    currentAdminId: authStore.userInfo.userId,
    pendingStatusId: pendingId,
    onEdit: openEdit,
    onRoleAssign: openRoleAssign,
    onPassword: openPasswordReset,
    onDelete: openDelete,
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
        <NButton size="small" type="primary" @click="openCreate">新增管理员</NButton>
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
    <AdminFormModal
      v-model:show="formModalVisible"
      v-model:form="adminForm"
      :editing="editing"
      :need-current-password="needCurrentPassword"
      :submitting="formSubmitting"
      @submit="submitAdminForm"
    />
    <AdminRoleModal
      v-model:show="roleModalVisible"
      v-model:form="roleForm"
      :target="roleTarget"
      :roles="roles"
      :changes="roleChanges"
      :roles-loading="roleLoading"
      :submitting="roleSubmitting"
      @submit="submitRoleAssign"
    />
    <AdminPasswordModal
      v-model:show="passwordModalVisible"
      v-model:form="passwordForm"
      :target="passwordTarget"
      :submitting="passwordSubmitting"
      @submit="submitPasswordReset"
    />
    <AdminDeleteModal
      v-model:show="deleteModalVisible"
      v-model:form="deleteForm"
      :target="deleteTarget"
      :submitting="deleteSubmitting"
      @submit="submitDelete"
    />
  </NCard>
</template>
