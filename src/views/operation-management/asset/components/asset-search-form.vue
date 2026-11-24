<script setup lang="ts">
import { NForm, NFormItem, NInput } from 'naive-ui';
import type { AssetTreeQueryModel } from '../typings';

defineOptions({ name: 'AssetSearchForm' });

const query = defineModel<AssetTreeQueryModel>('query', { required: true });
</script>

<template>
  <NForm :model="query" label-placement="left" :show-feedback="false">
    <NFormItem>
      <NInput v-model:value="query.keyword" clearable placeholder="搜索" />
    </NFormItem>
  </NForm>
</template>
