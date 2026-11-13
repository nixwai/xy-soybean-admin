<script setup lang="ts">
import { onMounted } from 'vue';
import { NAlert, NButton, NCard, NSpace } from 'naive-ui';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import PermissionCatalog from './components/permission-catalog.vue';

const { permissionLoading, permissionGroups, permissionTotal, loadPermissionCatalog } = usePermissionCatalog();

/** 拉取完整权限目录，权限启停成功后由子组件触发再次刷新。 */
async function load() {
  await loadPermissionCatalog();
}

onMounted(load);
</script>

<template>
  <NCard title="权限管理" :bordered="false" class="card-wrapper">
    <template #header-extra>
      <NSpace :size="8" align="center">
        <span class="text-13px text-#666">共 {{ permissionTotal }} 项权限</span>
        <NButton size="small" :loading="permissionLoading" @click="load">刷新</NButton>
      </NSpace>
    </template>
    <NAlert type="info" :bordered="false" class="mb-16px">
      权限目录由后端代码注册，此处只能启用或停用；受保护权限仅根管理员可用，不可分配权限不会出现在角色授权列表中。
    </NAlert>
    <PermissionCatalog :groups="permissionGroups" :loading="permissionLoading" @success="load" />
  </NCard>
</template>
