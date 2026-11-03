<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NTag } from 'naive-ui';
import { disablePermission, enablePermission, fetchPermissionList } from '@/service/api';

const loading = ref(false);
const items = ref<ApiManagement.Permission[]>([]);
const columns = computed(() => [
  { title: '编码', key: 'code' },
  { title: '资源', key: 'resource' },
  { title: '方法', key: 'method' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'description' },
  {
    title: '状态',
    key: 'isActive',
    render: (row: ApiManagement.Permission) => (
      <NTag type={row.isActive ? 'success' : 'error'}>{row.isActive ? '启用' : '停用'}</NTag>
    )
  },
  {
    title: '操作',
    key: 'actions',
    render: (row: ApiManagement.Permission) => (
      <NButton size="small" type={row.isActive ? 'warning' : 'success'} secondary onClick={() => toggle(row)}>
        {row.isActive ? '停用' : '启用'}
      </NButton>
    )
  }
]);

async function load() {
  loading.value = true;
  const result = await fetchPermissionList();
  if (!result.error && result.data) items.value = result.data.items;
  loading.value = false;
}
async function toggle(row: ApiManagement.Permission) {
  const result = row.isActive ? await disablePermission({ id: row.id }) : await enablePermission({ id: row.id });
  if (!result.error) await load();
}
onMounted(load);
</script>

<template>
  <div>
    <NCard title="权限管理" :bordered="false" class="card-wrapper">
      <NDataTable :columns="columns" :data="items" :loading="loading" :pagination="false" :scroll-x="1000" />
    </NCard>
  </div>
</template>
