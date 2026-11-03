<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NSwitch,
  NTag
} from 'naive-ui';
import { encryptPassword } from '@/utils/security';
import {
  createAdmin,
  fetchAdminList,
  fetchRoleList,
  resetAdminPassword,
  softDeleteAdmin,
  updateAdmin,
  bindAdminRole,
  unbindAdminRole
} from '@/service/api';

const loading = ref(false);
const showModal = ref(false);
const showPasswordModal = ref(false);
const editing = ref<ApiManagement.Admin | null>(null);
const roles = ref<ApiManagement.Role[]>([]);
const items = ref<ApiManagement.Admin[]>([]);
const total = ref(0);
const page = ref(1);
const form = ref({ username: '', password: '', isSuperAdmin: false, currentPassword: '', roleIds: [] as string[] });
const passwordForm = ref({ password: '', currentPassword: '' });

const columns = computed(() => [
  { title: '用户名', key: 'username' },
  {
    title: '管理员类型',
    key: 'isSuperAdmin',
    render: (row: ApiManagement.Admin) => (
      <NTag type={row.isSuperAdmin ? 'warning' : 'info'}>{row.isSuperAdmin ? '超级管理员' : '普通管理员'}</NTag>
    )
  },
  {
    title: '状态',
    key: 'isActive',
    render: (row: ApiManagement.Admin) => (
      <NTag type={row.isActive ? 'success' : 'error'}>{row.isActive ? '启用' : '停用'}</NTag>
    )
  },
  {
    title: '角色',
    key: 'roleIds',
    render: (row: ApiManagement.Admin) =>
      row.roleIds.map(id => roles.value.find(item => item.id === id)?.name || id).join('、') || '未绑定'
  },
  { title: '创建时间', key: 'createdAt' },
  {
    title: '操作',
    key: 'actions',
    render: (row: ApiManagement.Admin) => (
      <NSpace justify="center">
        <NButton size="small" type="primary" secondary onClick={() => openEdit(row)}>
          编辑
        </NButton>
        <NButton size="small" secondary onClick={() => openPassword(row)}>
          重置密码
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row)}>
          {{
            trigger: () => (
              <NButton size="small" type="error" secondary>
                删除
              </NButton>
            ),
            default: () => '删除后不可恢复，确认继续吗？'
          }}
        </NPopconfirm>
      </NSpace>
    )
  }
]);

async function load() {
  loading.value = true;
  const [adminResult, roleResult] = await Promise.all([
    fetchAdminList({ page: page.value, pageSize: 20 }),
    fetchRoleList({ page: 1, pageSize: 100 })
  ]);
  if (!adminResult.error && adminResult.data) {
    items.value = adminResult.data.items;
    total.value = adminResult.data.total;
  }
  if (!roleResult.error && roleResult.data) roles.value = roleResult.data.items;
  loading.value = false;
}

function openCreate() {
  editing.value = null;
  form.value = { username: '', password: '', isSuperAdmin: false, currentPassword: '', roleIds: [] };
  showModal.value = true;
}

function openEdit(row: ApiManagement.Admin) {
  editing.value = row;
  form.value = {
    username: row.username,
    password: '',
    isSuperAdmin: row.isSuperAdmin,
    currentPassword: '',
    roleIds: [...row.roleIds]
  };
  showModal.value = true;
}

function openPassword(row: ApiManagement.Admin) {
  editing.value = row;
  passwordForm.value = { password: '', currentPassword: '' };
  showPasswordModal.value = true;
}

async function submit() {
  if (!form.value.username || (!editing.value && !form.value.password)) return;
  const password = form.value.password ? await encryptPassword(form.value.password) : undefined;
  const currentPassword = form.value.currentPassword ? await encryptPassword(form.value.currentPassword) : undefined;
  const result = editing.value
    ? await updateAdmin({
        id: editing.value.id,
        username: form.value.username,
        isSuperAdmin: form.value.isSuperAdmin,
        ...(password ? { password } : {}),
        ...(currentPassword ? { currentPassword } : {})
      })
    : await createAdmin({
        username: form.value.username,
        password: password || '',
        isSuperAdmin: form.value.isSuperAdmin,
        ...(currentPassword ? { currentPassword } : {})
      });
  if (!result.error && result.data) {
    const previousRoleIds = editing.value?.roleIds || [];
    const nextRoleIds = new Set(form.value.roleIds);
    const oldRoleIds = new Set(previousRoleIds);
    await Promise.all(
      [...nextRoleIds]
        .filter(roleId => !oldRoleIds.has(roleId))
        .map(roleId => bindAdminRole({ adminId: result.data.id, roleId }))
    );
    await Promise.all(
      [...oldRoleIds]
        .filter(roleId => !nextRoleIds.has(roleId))
        .map(roleId => unbindAdminRole({ adminId: result.data.id, roleId }))
    );
    window.$message?.success(editing.value ? '管理员已更新' : '管理员已创建');
    showModal.value = false;
    await load();
  }
}

async function submitPassword() {
  if (!editing.value || !passwordForm.value.password || !passwordForm.value.currentPassword) return;
  const result = await resetAdminPassword({
    id: editing.value.id,
    password: await encryptPassword(passwordForm.value.password),
    currentPassword: await encryptPassword(passwordForm.value.currentPassword)
  });
  if (!result.error) {
    window.$message?.success('密码已重置');
    showPasswordModal.value = false;
  }
}

async function handleDelete(row: ApiManagement.Admin) {
  const currentPassword = window.prompt('请输入当前管理员密码');
  if (!currentPassword) return;
  const result = await softDeleteAdmin({ id: row.id, currentPassword: await encryptPassword(currentPassword) });
  if (!result.error) await load();
}

onMounted(load);
</script>

<template>
  <div>
    <NCard title="管理员管理" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton type="primary" @click="openCreate">新增管理员</NButton></template>
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange: (value: number) => { page = value; load(); } }"
        :scroll-x="1100"
      />
    </NCard>
    <NModal v-model:show="showModal" preset="card" :title="editing ? '编辑管理员' : '新增管理员'" style="width: 520px">
      <NForm label-placement="left" label-width="110">
        <NFormItem label="用户名"><NInput v-model:value="form.username" /></NFormItem>
        <NFormItem v-if="!editing" label="初始密码">
          <NInput v-model:value="form.password" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem v-else label="新密码">
          <NInput v-model:value="form.password" type="password" show-password-on="click" placeholder="留空表示不修改" />
        </NFormItem>
        <NFormItem label="超级管理员"><NSwitch v-model:value="form.isSuperAdmin" /></NFormItem>
        <NFormItem label="绑定角色">
          <NSelect
            v-model:value="form.roleIds"
            multiple
            :options="roles.map(role => ({ label: role.name, value: role.id }))"
          />
        </NFormItem>
        <NFormItem v-if="form.isSuperAdmin || form.password" label="当前密码">
          <NInput v-model:value="form.currentPassword" type="password" show-password-on="click" />
        </NFormItem>
      </NForm>
      <template #footer><NButton type="primary" @click="submit">保存</NButton></template>
    </NModal>
    <NModal v-model:show="showPasswordModal" preset="card" title="重置管理员密码" style="width: 520px">
      <NForm label-placement="left" label-width="110">
        <NFormItem label="新密码">
          <NInput v-model:value="passwordForm.password" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem label="当前密码">
          <NInput v-model:value="passwordForm.currentPassword" type="password" show-password-on="click" />
        </NFormItem>
      </NForm>
      <template #footer><NButton type="primary" @click="submitPassword">确认重置</NButton></template>
    </NModal>
  </div>
</template>
