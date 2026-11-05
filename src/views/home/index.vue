<script setup lang="ts">
import { $t } from '@/locales';
import { useHomeDashboard } from './hooks/use-home-dashboard';
import DashboardHeader from './components/dashboard-header.vue';
import DashboardStatGrid from './components/dashboard-stat-grid.vue';

const { loading, cards, isEmpty } = useHomeDashboard();
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <DashboardHeader :title="$t('page.home.title')" :description="$t('page.home.description')" />
    <NAlert v-if="!loading && isEmpty" type="info" :bordered="false">
      当前管理员没有可访问的统计数据，请联系根管理员为其绑定角色和权限。
    </NAlert>
    <DashboardStatGrid v-else :cards="cards" :loading="loading" />
  </div>
</template>
