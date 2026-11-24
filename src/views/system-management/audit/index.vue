<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NAlert, NButton, NCard, NDataTable, NSpace } from 'naive-ui';
import { createAuditColumns } from './utils/audit-columns';
import { useAuditOptions } from './hooks/use-audit-options';
import { useAuditQuery } from './hooks/use-audit-query';
import AuditSearchForm from './components/audit-search-form.vue';

const { loading, items, hasMore, query, load, search, reset } = useAuditQuery();
const { optionsLoading, actionOptions, resourceOptions, resultOptions, loadOptions } = useAuditOptions();

const columns = computed(() => createAuditColumns());

onMounted(() => {
  void Promise.all([load(true), loadOptions()]);
});
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <AuditSearchForm
        v-model:query="query"
        :loading="loading"
        :options-loading="optionsLoading"
        :action-options="actionOptions"
        :resource-options="resourceOptions"
        :result-options="resultOptions"
        @search="search"
        @reset="reset"
      />
    </NCard>

    <NCard title="审计日志" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="8" align="center">
          <span class="text-13px text-#666">已加载 {{ items.length }} 条</span>
          <NButton size="small" :loading="loading" @click="load(true)">刷新</NButton>
        </NSpace>
      </template>
      <NAlert type="info" :bordered="false" class="mb-16px">
        审计记录按创建时间倒序返回，使用游标分页且不提供总数，当前仅记录管理员、角色、权限和菜单的变更。
      </NAlert>
      <NDataTable
        size="small"
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="false"
        :scroll-x="1060"
        :row-key="row => row.id"
      />
      <div v-if="hasMore" class="mt-16px text-center">
        <NButton :loading="loading" @click="load()">加载更多</NButton>
      </div>
    </NCard>
  </NSpace>
</template>
