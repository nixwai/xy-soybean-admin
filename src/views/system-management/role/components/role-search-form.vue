<script setup lang="ts">
import { NButton, NForm, NFormItem, NGrid, NGi, NInput, NSelect, NSpace } from 'naive-ui';
import { ROLE_STATUS_OPTIONS, ROLE_TYPE_OPTIONS } from '../config/constants';
import type { RoleQueryModel } from '../typings';

defineOptions({ name: 'RoleSearchForm' });

interface Props {
  /** 当前角色列表是否正在请求。 */
  loading: boolean;
}

interface Emits {
  /** 按当前角色查询条件执行远程搜索。 */
  (event: 'search'): void;
  /** 清空角色查询条件并重新加载列表。 */
  (event: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const query = defineModel<RoleQueryModel>('query', { required: true });
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NGrid :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <NGi span="24 s:12 m:6">
        <NFormItem label="角色编码">
          <NInput v-model:value="query.code" clearable placeholder="角色编码" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="角色名称">
          <NInput v-model:value="query.name" clearable placeholder="角色名称" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="类型">
          <NSelect v-model:value="query.typeFilter" :options="ROLE_TYPE_OPTIONS" clearable placeholder="全部类型" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="状态">
          <NSelect v-model:value="query.statusFilter" :options="ROLE_STATUS_OPTIONS" clearable placeholder="全部状态" />
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
