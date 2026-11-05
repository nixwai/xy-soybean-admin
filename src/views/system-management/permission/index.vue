<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NAlert, NButton, NCard, NCollapse, NCollapseItem, NDataTable, NEmpty, NSpace } from 'naive-ui';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import { createPermissionColumns } from './utils/permission-columns';
import { usePermissionStatus } from './hooks/use-permission-status';

const { permissionLoading, permissionGroups, permissionTotal, loadPermissionCatalog } = usePermissionCatalog();
const { pendingId, toggle: togglePermission } = usePermissionStatus({ onSuccess: load });
const expandedCategories = ref<string[]>([]);

const columns = computed(() => createPermissionColumns({ pendingId, onToggle: togglePermission }));

/** 拉取完整权限目录并默认展开全部分类。 */
async function load() {
  await loadPermissionCatalog();
  expandedCategories.value = permissionGroups.value.map(group => group.category);
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
    <NEmpty v-if="!permissionLoading && !permissionGroups.length" description="暂无权限数据" class="py-32px" />
    <NCollapse v-else v-model:expanded-names="expandedCategories">
      <NCollapseItem v-for="group in permissionGroups" :key="group.category" :name="group.category">
        <template #header>
          <span class="text-14px font-500">{{ group.categoryName }}</span>
        </template>
        <template #header-extra>
          <span class="text-12px text-#999">{{ group.category }} · {{ group.permissions.length }} 项</span>
        </template>
        <NDataTable
          size="small"
          :columns="columns"
          :data="group.permissions"
          :loading="permissionLoading"
          :pagination="false"
          :scroll-x="1010"
          :row-key="row => row.id"
        />
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>
