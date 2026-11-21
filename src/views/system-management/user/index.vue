<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { PERMISSION_CODE } from '@/constants/permission';
import { useAuth } from '@/hooks/business/auth';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { createUserColumns } from './utils/user-columns';
import { useUserQuery } from './hooks/use-user-query';
import { useUserStatus } from './hooks/use-user-status';
import UserSearchForm from './components/user-search-form.vue';

const { hasAuth } = useAuth();
const canUpdate = computed(() => hasAuth(PERMISSION_CODE.USER_UPDATE));
const { loading, items, total, page, pageSize, query, load, search, reset, changePage, changePageSize } =
  useUserQuery();
const { pendingId, toggle: toggleStatus } = useUserStatus({ onSuccess: load });

const columns = computed(() =>
  createUserColumns({
    canUpdate: canUpdate.value,
    pendingStatusId: pendingId,
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

onMounted(load);
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <UserSearchForm v-model:query="query" :loading="loading" @search="search" @reset="reset" />
    </NCard>

    <NCard title="用户管理" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NButton size="small" :loading="loading" @click="load">刷新</NButton>
      </template>
      <NDataTable
        remote
        size="small"
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1080"
        :row-key="row => row.id"
      />
    </NCard>
  </NSpace>
</template>
