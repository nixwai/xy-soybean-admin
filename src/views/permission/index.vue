<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NCard, NDataTable } from 'naive-ui';
import { createPermissionColumns } from './utils/permission-columns';
import { usePermissionQuery } from './hooks/use-permission-query';
import { usePermissionStatus } from './hooks/use-permission-status';

const { loading, items, load } = usePermissionQuery();
const { toggle: togglePermission } = usePermissionStatus({ onSuccess: load });
const columns = computed(() => createPermissionColumns({ onToggle: togglePermission }));

onMounted(load);
</script>

<template>
  <div>
    <NCard title="权限管理" :bordered="false" class="card-wrapper">
      <NDataTable :columns="columns" :data="items" :loading="loading" :pagination="false" :scroll-x="1000" />
    </NCard>
  </div>
</template>
