<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import { createMenuColumns } from './utils/menu-columns';
import { useMenuDelete } from './hooks/use-menu-delete';
import { useMenuFormSubmit } from './hooks/use-menu-form-submit';
import { useMenuQuery } from './hooks/use-menu-query';
import { useMenuStatus } from './hooks/use-menu-status';
import MenuFormModal from './components/menu-form-modal.vue';

const { loading, items, load } = useMenuQuery();
const {
  showModal,
  editing,
  form,
  openCreate,
  openEdit,
  submit: submitMenuForm
} = useMenuFormSubmit({ onSuccess: load });
const { toggle: toggleMenu } = useMenuStatus({ onSuccess: load });
const { remove: deleteMenu } = useMenuDelete({ onSuccess: load });
const columns = computed(() => createMenuColumns({ onEdit: openEdit, onToggle: toggleMenu, onDelete: deleteMenu }));

onMounted(load);
</script>

<template>
  <div>
    <NCard title="菜单管理" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NButton type="primary" @click="openCreate(items.length + 1)">新增菜单</NButton>
      </template>
      <NDataTable :columns="columns" :data="items" :loading="loading" :pagination="false" :scroll-x="1000" />
    </NCard>
    <MenuFormModal v-model:show="showModal" v-model:form="form" :editing="editing" @submit="submitMenuForm" />
  </div>
</template>
