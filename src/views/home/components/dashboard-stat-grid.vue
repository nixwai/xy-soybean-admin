<script setup lang="ts">
import { NCard, NGi, NGrid } from 'naive-ui';
import type { HomeStatCard } from '../typings';

interface Props {
  cards: HomeStatCard[];
  loading: boolean;
}

defineProps<Props>();
</script>

<template>
  <NGrid :x-gap="16" :y-gap="16" cols="1 600:2 900:5" responsive="screen">
    <NGi v-for="card in cards" :key="card.label">
      <NCard :bordered="false" class="card-wrapper" :loading="loading">
        <div class="flex-y-center justify-between">
          <div>
            <div class="text-14px text-secondary">{{ card.label }}</div>
            <div class="mt-8px text-28px font-600">{{ card.value }}</div>
          </div>
          <SvgIcon :icon="card.icon" class="text-32px text-primary" />
        </div>
      </NCard>
    </NGi>
  </NGrid>
</template>
