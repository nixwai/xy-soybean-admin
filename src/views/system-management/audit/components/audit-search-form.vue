<script setup lang="ts">
import { NButton, NDatePicker, NForm, NFormItem, NGrid, NGi, NInput, NSelect, NSpace } from 'naive-ui';
import type { AuditOption, AuditQueryModel } from '../typings';

defineOptions({ name: 'AuditSearchForm' });

interface Props {
  /** 当前审计日志是否正在请求。 */
  loading: boolean;
  /** 审计筛选项是否正在加载。 */
  optionsLoading: boolean;
  /** 审计动作筛选项。 */
  actionOptions: AuditOption[];
  /** 审计资源筛选项。 */
  resourceOptions: AuditOption[];
  /** 审计结果筛选项。 */
  resultOptions: AuditOption[];
}

interface Emits {
  /** 按当前审计筛选条件查询。 */
  (event: 'search'): void;
  /** 清空审计筛选条件并重新查询。 */
  (event: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const query = defineModel<AuditQueryModel>('query', { required: true });
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NGrid :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <NGi span="24 s:12 m:6">
        <NFormItem label="操作者 ID">
          <NInput v-model:value="query.actorAdminId" clearable placeholder="管理员 ID" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="目标 ID">
          <NInput v-model:value="query.targetId" clearable placeholder="资源目标 ID" @keyup.enter="emit('search')" />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="操作">
          <NSelect
            v-model:value="query.actionFilter"
            :options="props.actionOptions"
            :loading="props.optionsLoading"
            clearable
            placeholder="全部操作"
          />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="资源">
          <NSelect
            v-model:value="query.resourceTypeFilter"
            :options="props.resourceOptions"
            :loading="props.optionsLoading"
            clearable
            placeholder="全部资源"
          />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="结果">
          <NSelect
            v-model:value="query.resultFilter"
            :options="props.resultOptions"
            :loading="props.optionsLoading"
            clearable
            placeholder="全部结果"
          />
        </NFormItem>
      </NGi>
      <NGi span="24 s:12 m:6">
        <NFormItem label="时间">
          <NDatePicker v-model:value="query.createdRange" type="daterange" clearable class="w-full" />
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
