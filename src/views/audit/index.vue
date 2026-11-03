<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NTag } from 'naive-ui';
import { fetchAuditList } from '@/service/api';

const loading = ref(false);
const items = ref<ApiManagement.AuditLog[]>([]);
const nextCursor = ref<string | undefined>();
const hasMore = ref(false);
const columns = computed(() => [
  { title: '时间', key: 'createdAt' },
  { title: '动作', key: 'action' },
  { title: '资源', key: 'resourceType' },
  { title: '目标 ID', key: 'targetId' },
  {
    title: '结果',
    key: 'succeeded',
    render: (row: ApiManagement.AuditLog) => (
      <NTag type={row.succeeded ? 'success' : 'error'}>{row.succeeded ? '成功' : '失败'}</NTag>
    )
  },
  {
    title: '详情',
    key: 'details',
    render: (row: ApiManagement.AuditLog) => (row.details ? JSON.stringify(row.details) : '-')
  }
]);

async function load(reset = false) {
  loading.value = true;
  const result = await fetchAuditList({
    limit: 20,
    ...(reset ? {} : nextCursor.value ? { cursor: nextCursor.value } : {})
  });
  if (!result.error && result.data) {
    items.value = reset ? result.data.items : [...items.value, ...result.data.items];
    nextCursor.value = result.data.nextCursor || undefined;
    hasMore.value = result.data.hasMore;
  }
  loading.value = false;
}
onMounted(() => load(true));
</script>

<template>
  <div>
    <NCard title="审计日志" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton @click="load(true)">刷新</NButton></template>
      <NDataTable :columns="columns" :data="items" :loading="loading" :pagination="false" :scroll-x="1100" />
      <div v-if="hasMore" class="mt-16px text-center">
        <NButton :loading="loading" @click="load()">加载更多</NButton>
      </div>
    </NCard>
  </div>
</template>
