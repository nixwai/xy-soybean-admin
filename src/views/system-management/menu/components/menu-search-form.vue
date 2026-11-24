<script setup lang="ts">
import { NButton, NForm, NFormItem, NGrid, NGi, NInput, NSelect, NSpace } from 'naive-ui';
import { MENU_PERMISSION_OPTIONS, MENU_STATUS_OPTIONS } from '../config/constants';
import type { MenuQueryModel } from '../typings';

defineOptions({ name: 'MenuSearchForm' });

interface Props {
  /** 当前菜单列表是否正在请求。 */
  loading: boolean;
}

interface Emits {
  /** 应用当前菜单筛选条件。 */
  (event: 'search'): void;
  /** 清空菜单筛选条件。 */
  (event: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const query = defineModel<MenuQueryModel>('query', { required: true });
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NGrid :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <NGi span="24 s:12 m:6">
        <NFormItem label="菜单标题">
          <NInput v-model:value="query.title" clearable placeholder="菜单标题" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="菜单标识">
          <NInput v-model:value="query.menuKey" clearable placeholder="菜单标识" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="路径">
          <NInput v-model:value="query.path" clearable placeholder="菜单路径" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="权限编码">
          <NInput v-model:value="query.permissionCode" clearable placeholder="权限编码" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="状态">
          <NSelect v-model:value="query.statusFilter" :options="MENU_STATUS_OPTIONS" clearable placeholder="全部状态" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="权限">
          <NSelect
            v-model:value="query.permissionFilter"
            :options="MENU_PERMISSION_OPTIONS"
            clearable
            placeholder="全部权限"
          />
        </NFormItem>
      </NGi>
      <NGi span="24">
        <NFormItem>
          <NSpace justify="start" class="w-full">
            <NButton type="primary" :loading="props.loading" @click="emit('search')">查询</NButton>
            <NButton :disabled="props.loading" @click="emit('reset')">重置</NButton>
          </NSpace>
        </NFormItem>
      </NGi>
    </NGrid>
  </NForm>
</template>
