<script setup lang="ts">
import { NButton, NForm, NFormItem, NGrid, NGi, NInput, NSelect, NSpace } from 'naive-ui';
import { PERMISSION_STATUS_OPTIONS } from '../config/constants';
import type { PermissionQueryModel } from '../typings';

defineOptions({ name: 'PermissionSearchForm' });

interface Props {
  /** 当前权限目录是否正在请求。 */
  loading: boolean;
  /** 权限分类选项。 */
  categoryOptions: Array<{ label: string; value: string }>;
}

interface Emits {
  /** 应用当前权限筛选条件。 */
  (event: 'search'): void;
  /** 清空权限筛选条件。 */
  (event: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const query = defineModel<PermissionQueryModel>('query', { required: true });
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NGrid :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <NGi span="24 s:12 m:6">
        <NFormItem label="权限编码">
          <NInput v-model:value="query.code" clearable placeholder="权限编码" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="权限名称">
          <NInput v-model:value="query.name" clearable placeholder="权限名称" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="权限描述">
          <NInput v-model:value="query.description" clearable placeholder="权限描述" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="分类">
          <NSelect
            v-model:value="query.categoryFilter"
            :options="props.categoryOptions"
            clearable
            placeholder="全部分类"
          />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="状态">
          <NSelect
            v-model:value="query.statusFilter"
            :options="PERMISSION_STATUS_OPTIONS"
            clearable
            placeholder="全部状态"
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
