<script setup lang="ts">
import { NCard } from 'naive-ui';

interface Props {
  title: string;
  description: string;
}

defineProps<Props>();
</script>

<template>
  <NCard :title="title" :bordered="false" class="card-wrapper">
    <p class="m-0 text-16px text-secondary">{{ description }}</p>
  </NCard>
</template>
