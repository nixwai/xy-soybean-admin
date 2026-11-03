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
  NSpace,
  NSwitch,
  NTag
} from 'naive-ui';
import { createMenu, disableMenu, enableMenu, fetchMenuList, softDeleteMenu, updateMenu } from '@/service/api';

const loading = ref(false);
const showModal = ref(false);
const editing = ref<ApiManagement.Menu | null>(null);
const items = ref<ApiManagement.Menu[]>([]);
const form = ref({ parentId: '', title: '', path: '', icon: '', order: '1', permissionCode: '', isActive: true });

const columns = computed(() => [
  { title: '标题', key: 'title' },
  { title: '路径', key: 'path' },
  { title: '权限编码', key: 'permissionCode' },
  { title: '排序', key: 'order' },
  {
    title: '状态',
    key: 'isActive',
    render: (row: ApiManagement.Menu) => (
      <NTag type={row.isActive ? 'success' : 'error'}>{row.isActive ? '启用' : '停用'}</NTag>
    )
  },
  {
    title: '操作',
    key: 'actions',
    render: (row: ApiManagement.Menu) => (
      <NSpace justify="center">
        <NButton size="small" type="primary" secondary onClick={() => openEdit(row)}>
          编辑
        </NButton>
        <NButton size="small" secondary onClick={() => toggle(row)}>
          {row.isActive ? '停用' : '启用'}
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row)}>
          {{
            trigger: () => (
              <NButton size="small" type="error" secondary>
                删除
              </NButton>
            ),
            default: () => '确认删除该菜单吗？'
          }}
        </NPopconfirm>
      </NSpace>
    )
  }
]);

async function load() {
  loading.value = true;
  const result = await fetchMenuList();
  if (!result.error && result.data) items.value = result.data.items;
  loading.value = false;
}
function openCreate() {
  editing.value = null;
  form.value = {
    parentId: '',
    title: '',
    path: '',
    icon: '',
    order: String(items.value.length + 1),
    permissionCode: '',
    isActive: true
  };
  showModal.value = true;
}
function openEdit(row: ApiManagement.Menu) {
  editing.value = row;
  form.value = {
    parentId: row.parentId || '',
    title: row.title,
    path: row.path,
    icon: row.icon || '',
    order: String(row.order),
    permissionCode: row.permissionCode || '',
    isActive: row.isActive
  };
  showModal.value = true;
}
async function submit() {
  if (!form.value.title || !form.value.path) return;
  const data = {
    parentId: form.value.parentId || null,
    title: form.value.title,
    path: form.value.path,
    icon: form.value.icon || undefined,
    order: Number(form.value.order),
    permissionCode: form.value.permissionCode || null,
    ...(editing.value ? { id: editing.value.id, isActive: form.value.isActive } : {})
  };
  const result = editing.value ? await updateMenu(data as ApiManagement.MenuUpdateRequest) : await createMenu(data);
  if (!result.error) {
    showModal.value = false;
    await load();
  }
}
async function toggle(row: ApiManagement.Menu) {
  const result = row.isActive ? await disableMenu({ id: row.id }) : await enableMenu({ id: row.id });
  if (!result.error) await load();
}
async function handleDelete(row: ApiManagement.Menu) {
  const result = await softDeleteMenu({ id: row.id });
  if (!result.error) await load();
}
onMounted(load);
</script>

<template>
  <div>
    <NCard title="菜单管理" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton type="primary" @click="openCreate">新增菜单</NButton></template>
      <NDataTable :columns="columns" :data="items" :loading="loading" :pagination="false" :scroll-x="1000" />
    </NCard>
    <NModal v-model:show="showModal" preset="card" :title="editing ? '编辑菜单' : '新增菜单'" style="width: 560px">
      <NForm label-placement="left" label-width="100">
        <NFormItem label="菜单标题"><NInput v-model:value="form.title" /></NFormItem>
        <NFormItem label="菜单路径"><NInput v-model:value="form.path" /></NFormItem>
        <NFormItem label="图标"><NInput v-model:value="form.icon" placeholder="carbon:menu" /></NFormItem>
        <NFormItem label="排序"><NInput v-model:value="form.order" /></NFormItem>
        <NFormItem label="权限编码"><NInput v-model:value="form.permissionCode" placeholder="可留空" /></NFormItem>
        <NFormItem v-if="editing" label="状态"><NSwitch v-model:value="form.isActive" /></NFormItem>
      </NForm>
      <template #footer><NButton type="primary" @click="submit">保存</NButton></template>
    </NModal>
  </div>
</template>
