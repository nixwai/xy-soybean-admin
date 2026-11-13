<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NDataTable, NEmpty } from 'naive-ui';
import { createPermissionColumns } from '../utils/permission-columns';
import { usePermissionStatus } from '../hooks/use-permission-status';

interface Props {
  /** 权限目录分组。 */
  groups: ApiManagement.PermissionGroup[];
  /** 权限目录加载状态。 */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), { loading: false });
const emit = defineEmits<{ success: [] }>();

const expandedCategories = ref<string[]>([]);

const { pendingId, toggle: togglePermission } = usePermissionStatus({
  onSuccess: () => emit('success')
});

const columns = computed(() => createPermissionColumns({ pendingId, onToggle: togglePermission }));

watch(
  () => props.groups,
  groups => {
    expandedCategories.value = groups.map(group => group.category);
  },
  { immediate: true }
);
</script>

<template>
  <NEmpty v-if="!props.loading && !props.groups.length" description="暂无权限数据" class="py-32px" />
  <NCollapse v-else v-model:expanded-names="expandedCategories">
    <NCollapseItem v-for="group in props.groups" :key="group.category" :name="group.category">
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
        :loading="props.loading"
        :pagination="false"
        :scroll-x="1010"
        :row-key="row => row.id"
      />
    </NCollapseItem>
  </NCollapse>
</template>
