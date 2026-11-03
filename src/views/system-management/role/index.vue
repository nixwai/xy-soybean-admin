<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import { ROLE_PAGE_SIZE } from './config/constants';
import { createRoleColumns } from './utils/role-columns';
import { useRoleDelete } from './hooks/use-role-delete';
import { useRoleFormSubmit } from './hooks/use-role-form-submit';
import { useRoleQuery } from './hooks/use-role-query';
import RoleFormModal from './components/role-form-modal.vue';

const { loading, items, permissions, total, page, load, changePage } = useRoleQuery();
const {
  showModal,
  editing,
  form,
  openCreate,
  openEdit,
  submit: submitRoleForm
} = useRoleFormSubmit({ onSuccess: load });
const { remove: deleteRole } = useRoleDelete({ onSuccess: load });
const columns = computed(() => createRoleColumns({ onEdit: openEdit, onDelete: deleteRole }));

onMounted(load);
</script>

<template>
  <div>
    <NCard title="角色管理" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton type="primary" @click="openCreate">新增角色</NButton></template>
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="{ page, pageSize: ROLE_PAGE_SIZE, itemCount: total, onChange: changePage }"
        :scroll-x="1000"
      />
    </NCard>
    <RoleFormModal
      v-model:show="showModal"
      v-model:form="form"
      :editing="editing"
      :permissions="permissions"
      @submit="submitRoleForm"
    />
  </div>
</template>
