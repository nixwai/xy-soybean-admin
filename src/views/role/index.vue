<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSpace,
  NSwitch,
  NTag
} from 'naive-ui';
import {
  bindRolePermission,
  createRole,
  fetchPermissionList,
  fetchRoleList,
  softDeleteRole,
  unbindRolePermission,
  updateRole
} from '@/service/api';

const loading = ref(false);
const showModal = ref(false);
const editing = ref<ApiManagement.Role | null>(null);
const items = ref<ApiManagement.Role[]>([]);
const permissions = ref<ApiManagement.Permission[]>([]);
const total = ref(0);
const page = ref(1);
const form = ref({ code: '', name: '', description: '', isActive: true, permissionIds: [] as string[] });

const columns = computed(() => [
  { title: '编码', key: 'code' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'description' },
  {
    title: '状态',
    key: 'isActive',
    render: (row: ApiManagement.Role) => (
      <NTag type={row.isActive ? 'success' : 'error'}>{row.isActive ? '启用' : '停用'}</NTag>
    )
  },
  { title: '权限数', key: 'permissionIds', render: (row: ApiManagement.Role) => row.permissionIds.length },
  {
    title: '操作',
    key: 'actions',
    render: (row: ApiManagement.Role) => (
      <NSpace justify="center">
        <NButton size="small" type="primary" secondary onClick={() => openEdit(row)}>
          编辑
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row)}>
          {{
            trigger: () => (
              <NButton size="small" type="error" secondary>
                删除
              </NButton>
            ),
            default: () => '确认删除该角色吗？'
          }}
        </NPopconfirm>
      </NSpace>
    )
  }
]);

async function load() {
  loading.value = true;
  const [roleResult, permissionResult] = await Promise.all([
    fetchRoleList({ page: page.value, pageSize: 20 }),
    fetchPermissionList()
  ]);
  if (!roleResult.error && roleResult.data) {
    items.value = roleResult.data.items;
    total.value = roleResult.data.total;
  }
  if (!permissionResult.error && permissionResult.data) permissions.value = permissionResult.data.items;
  loading.value = false;
}

function openCreate() {
  editing.value = null;
  form.value = { code: '', name: '', description: '', isActive: true, permissionIds: [] };
  showModal.value = true;
}
function openEdit(row: ApiManagement.Role) {
  editing.value = row;
  form.value = {
    code: row.code,
    name: row.name,
    description: row.description || '',
    isActive: row.isActive,
    permissionIds: [...row.permissionIds]
  };
  showModal.value = true;
}

async function syncPermissions(roleId: string, previous: string[]) {
  const next = new Set(form.value.permissionIds);
  const old = new Set(previous);
  await Promise.all(
    [...next].filter(id => !old.has(id)).map(permissionId => bindRolePermission({ roleId, permissionId }))
  );
  await Promise.all(
    [...old].filter(id => !next.has(id)).map(permissionId => unbindRolePermission({ roleId, permissionId }))
  );
}

async function submit() {
  if (!form.value.name || (!editing.value && !form.value.code)) return;
  const result = editing.value
    ? await updateRole({
        id: editing.value.id,
        name: form.value.name,
        description: form.value.description,
        isActive: form.value.isActive
      })
    : await createRole({ code: form.value.code, name: form.value.name, description: form.value.description });
  if (!result.error && result.data) {
    await syncPermissions(result.data.id, editing.value?.permissionIds || []);
    window.$message?.success(editing.value ? '角色已更新' : '角色已创建');
    showModal.value = false;
    await load();
  }
}

async function handleDelete(row: ApiManagement.Role) {
  const result = await softDeleteRole({ id: row.id });
  if (!result.error) await load();
}
onMounted(load);
</script>

<template>
  <div>
    <NCard title="角色管理" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton type="primary" @click="openCreate">新增角色</NButton></template>
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange: (value: number) => { page = value; load(); } }"
        :scroll-x="1000"
      />
    </NCard>
    <NModal v-model:show="showModal" preset="card" :title="editing ? '编辑角色' : '新增角色'" style="width: 620px">
      <NForm label-placement="left" label-width="100">
        <NFormItem label="角色编码"><NInput v-model:value="form.code" :disabled="Boolean(editing)" /></NFormItem>
        <NFormItem label="角色名称"><NInput v-model:value="form.name" /></NFormItem>
        <NFormItem label="角色描述"><NInput v-model:value="form.description" type="textarea" /></NFormItem>
        <NFormItem v-if="editing" label="状态"><NSwitch v-model:value="form.isActive" /></NFormItem>
        <NFormItem label="权限">
          <NCheckboxGroup v-model:value="form.permissionIds" class="grid grid-cols-2 gap-8px">
            <NCheckbox
              v-for="permission in permissions"
              :key="permission.id"
              :value="permission.id"
              :label="permission.name"
            />
          </NCheckboxGroup>
        </NFormItem>
      </NForm>
      <template #footer><NButton type="primary" @click="submit">保存</NButton></template>
    </NModal>
  </div>
</template>
