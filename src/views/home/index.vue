<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchAdminList, fetchAuditList, fetchMenuList, fetchPermissionList, fetchRoleList } from '@/service/api';
import { $t } from '@/locales';

const loading = ref(true);
const stats = ref({ admins: 0, roles: 0, permissions: 0, menus: 0, audits: 0 });
const cards = computed(() => [
  { label: $t('page.home.adminCount'), value: stats.value.admins, icon: 'carbon:user-admin' },
  { label: $t('page.home.roleCount'), value: stats.value.roles, icon: 'carbon:identification' },
  { label: $t('page.home.permissionCount'), value: stats.value.permissions, icon: 'carbon:security' },
  { label: $t('page.home.menuCount'), value: stats.value.menus, icon: 'carbon:menu' },
  { label: $t('page.home.auditCount'), value: stats.value.audits, icon: 'carbon:activity' }
]);

onMounted(async () => {
  const [admins, roles, permissions, menus, audits] = await Promise.all([
    fetchAdminList({ page: 1, pageSize: 1 }),
    fetchRoleList({ page: 1, pageSize: 1 }),
    fetchPermissionList(),
    fetchMenuList(),
    fetchAuditList({ limit: 1 })
  ]);
  stats.value = {
    admins: admins.data?.total || 0,
    roles: roles.data?.total || 0,
    permissions: permissions.data?.total || 0,
    menus: menus.data?.total || 0,
    audits: audits.data?.items.length || 0
  };
  loading.value = false;
});
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NCard :title="$t('page.home.title')" :bordered="false" class="card-wrapper">
      <p class="m-0 text-16px text-secondary">{{ $t('page.home.description') }}</p>
    </NCard>
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
  </div>
</template>
