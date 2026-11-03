<script setup lang="ts">
import { $t } from '@/locales';
import { useHomeDashboard } from './hooks/use-home-dashboard';
import DashboardHeader from './components/dashboard-header.vue';
import DashboardStatGrid from './components/dashboard-stat-grid.vue';

const { loading, cards } = useHomeDashboard();
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <DashboardHeader :title="$t('page.home.title')" :description="$t('page.home.description')" />
    <DashboardStatGrid :cards="cards" :loading="loading" />
  </div>
</template>
