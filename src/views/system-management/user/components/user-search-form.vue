<script setup lang="ts">
import { NButton, NForm, NFormItem, NGrid, NGi, NInput, NSelect, NSpace } from 'naive-ui';
import type { UserQueryModel } from '@/views/system-management/user/typings';
import { USER_STATUS_OPTIONS } from '../config/constants';

defineOptions({
  name: 'UserSearchForm'
});

interface Props {
  /** 当前用户列表是否正在请求。 */
  loading: boolean;
}

interface Emits {
  /** 按当前用户查询条件执行远程搜索。 */
  (e: 'search'): void;
  /** 清空用户查询条件并重新加载列表。 */
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/** 查询模型由用户查询 hook 统一维护，组件只负责输入与事件转发。 */
const query = defineModel<UserQueryModel>('query', {
  required: true
});
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NGrid :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <NGi span="24 s:12 m:6">
        <NFormItem label="用户 ID">
          <NInput v-model:value="query.id" clearable placeholder="用户 ID" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="昵称">
          <NInput v-model:value="query.nickname" clearable placeholder="用户昵称" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="openId">
          <NInput v-model:value="query.openId" clearable placeholder="微信 openId" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="unionId">
          <NInput v-model:value="query.unionId" clearable placeholder="微信 unionId" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="状态">
          <NSelect v-model:value="query.statusFilter" :options="USER_STATUS_OPTIONS" clearable placeholder="全部状态" />
        </NFormItem>
      </NGi>
      <NGi span="24">
        <NFormItem>
          <NSpace justify="start" class="w-full">
            <NButton type="primary" :loading="props.loading" @click="emit('search')" @keyup.enter="emit('search')">
              查询
            </NButton>
            <NButton :disabled="props.loading" @click="emit('reset')">重置</NButton>
          </NSpace>
        </NFormItem>
      </NGi>
    </NGrid>
  </NForm>
</template>
