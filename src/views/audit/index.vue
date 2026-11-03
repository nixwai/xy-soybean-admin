<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import { createAuditColumns } from './utils/audit-columns';
import { useAuditQuery } from './hooks/use-audit-query';

const { loading, items, hasMore, load } = useAuditQuery();
const columns = computed(createAuditColumns);

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
