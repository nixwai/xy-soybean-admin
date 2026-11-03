<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import { ADMIN_PAGE_SIZE } from './config/constants';
import { createAdminColumns } from './utils/admin-columns';
import { useAdminDelete } from './hooks/use-admin-delete';
import { useAdminFormSubmit } from './hooks/use-admin-form-submit';
import { useAdminPasswordReset } from './hooks/use-admin-password-reset';
import { useAdminQuery } from './hooks/use-admin-query';
import AdminFormModal from './components/admin-form-modal.vue';
import AdminPasswordModal from './components/admin-password-modal.vue';

const { loading, items, roles, total, page, load, changePage } = useAdminQuery();
const {
  showModal: formModalVisible,
  editing: formEditing,
  form: adminForm,
  openCreate,
  openEdit,
  submit: submitAdminForm
} = useAdminFormSubmit({ onSuccess: load });
const {
  showModal: passwordModalVisible,
  form: passwordForm,
  open: openPasswordReset,
  submit: submitPasswordReset
} = useAdminPasswordReset();
const { remove: deleteAdmin } = useAdminDelete({ onSuccess: load });
const columns = computed(() =>
  createAdminColumns({ roles, onEdit: openEdit, onPassword: openPasswordReset, onDelete: deleteAdmin })
);

onMounted(load);
</script>

<template>
  <div>
    <NCard title="管理员管理" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton type="primary" @click="openCreate">新增管理员</NButton></template>
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="{ page, pageSize: ADMIN_PAGE_SIZE, itemCount: total, onChange: changePage }"
        :scroll-x="1100"
      />
    </NCard>
    <AdminFormModal
      v-model:show="formModalVisible"
      v-model:form="adminForm"
      :editing="formEditing"
      :roles="roles"
      @submit="submitAdminForm"
    />
    <AdminPasswordModal v-model:show="passwordModalVisible" v-model:form="passwordForm" @submit="submitPasswordReset" />
  </div>
</template>
