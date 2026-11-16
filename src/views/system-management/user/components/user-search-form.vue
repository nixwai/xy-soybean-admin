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
      <NGi span="24 s:12 m:8">
        <NFormItem label="关键词">
          <NInput
            v-model:value="query.keyword"
            clearable
            placeholder="用户 ID、微信标识或昵称"
            @keyup.enter="emit('search')"
          />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:8">
        <NFormItem label="状态">
          <NSelect v-model:value="query.statusFilter" :options="USER_STATUS_OPTIONS" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:8">
        <NFormItem>
          <NSpace justify="end" class="w-full">
            <NButton :disabled="props.loading" @click="emit('reset')">重置</NButton>
            <NButton type="primary" :loading="props.loading" @click="emit('search')">查询</NButton>
          </NSpace>
        </NFormItem>
      </NGi>
    </NGrid>
  </NForm>
</template>
