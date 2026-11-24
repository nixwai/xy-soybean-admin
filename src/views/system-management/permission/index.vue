<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { NAlert, NButton, NCard, NSpace } from 'naive-ui';
import { usePermissionCatalog } from '../hooks/use-permission-catalog';
import { createDefaultPermissionQuery } from './config/constants';
import { filterPermissionGroups } from './utils/permission-filter';
import PermissionCatalog from './components/permission-catalog.vue';
import PermissionSearchForm from './components/permission-search-form.vue';

const { permissionLoading, permissionGroups, loadPermissionCatalog } = usePermissionCatalog();
const query = reactive(createDefaultPermissionQuery());
const appliedQuery = ref(createDefaultPermissionQuery());
const filteredGroups = computed(() => filterPermissionGroups(permissionGroups.value, appliedQuery.value));
const categoryOptions = computed(() =>
  permissionGroups.value.map(group => ({ label: group.categoryName, value: group.category }))
);
const filteredPermissionTotal = computed(() =>
  filteredGroups.value.reduce((total, group) => total + group.permissions.length, 0)
);

/** 拉取完整权限目录，权限启停成功后由子组件触发再次刷新。 */
async function load() {
  await loadPermissionCatalog();
}

/** 权限目录筛选由前端完成，避免重复请求完整目录。 */
function search() {
  appliedQuery.value = { ...query };
}

/** 清空权限筛选条件并保留已加载的完整目录。 */
function reset() {
  const defaults = createDefaultPermissionQuery();
  Object.assign(query, defaults);
  appliedQuery.value = defaults;
}

onMounted(load);
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <PermissionSearchForm
        v-model:query="query"
        :loading="permissionLoading"
        :category-options="categoryOptions"
        @search="search"
        @reset="reset"
      />
    </NCard>

    <NCard title="权限管理" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="8" align="center">
          <span class="text-13px text-#666">共 {{ filteredPermissionTotal }} 项权限</span>
          <NButton size="small" :loading="permissionLoading" @click="load">刷新</NButton>
        </NSpace>
      </template>
      <NAlert type="info" :bordered="false" class="mb-16px">
        权限目录由后端代码注册，此处只能启用或停用；受保护权限仅根管理员可用，不可分配权限不会出现在角色授权列表中。
      </NAlert>
      <PermissionCatalog :groups="filteredGroups" :loading="permissionLoading" @success="load" />
    </NCard>
  </NSpace>
</template>
