<script setup lang="ts">
import { computed, watch } from 'vue';
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NTreeSelect
} from 'naive-ui';
import { useNaiveForm } from '@/hooks/common/form';
import { MENU_DEFAULT_ORDER } from '../config/constants';
import { createMenuFormRules } from '../config/rules';
import type { MenuFormModel, MenuTreeOption } from '../typings';

interface Props {
  /** 正在编辑的菜单，为空表示新增。 */
  editing: ApiManagement.Menu | null;
  /** 父级菜单候选项，已排除当前编辑菜单及其子孙。 */
  parentOptions: MenuTreeOption[];
  /** 可选权限编码选项，仅包含启用状态的权限。 */
  permissionOptions: { label: string; value: string }[];
  /** 权限编码到权限记录的映射，用于受保护权限联动校验。 */
  permissionByCode: Map<string, ApiManagement.Permission>;
  /** 权限目录是否正在加载。 */
  permissionLoading?: boolean;
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), { permissionLoading: false, submitting: false });
const visible = defineModel<boolean>('show', { required: true });
const form = defineModel<MenuFormModel>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const { formRef, restoreValidation } = useNaiveForm();

/** 当前选中的权限记录，用于受保护权限的联动提示和校验。 */
const selectedPermission = computed(() =>
  form.value.permissionCode ? (props.permissionByCode.get(form.value.permissionCode) ?? null) : null
);

const rules = computed(() =>
  createMenuFormRules({
    getPermission: () => selectedPermission.value,
    getIsRootOnly: () => form.value.isRootOnly
  })
);

// NInputNumber 允许清空为 null，这里收敛为表单模型要求的数字类型
const orderValue = computed({
  get: () => form.value.order,
  set: value => {
    form.value.order = value ?? MENU_DEFAULT_ORDER;
  }
});

watch(visible, value => {
  if (value) restoreValidation();
});

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  emit('submit');
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="editing ? '编辑菜单' : '新增菜单'"
    class="w-620px"
    :mask-closable="false"
  >
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="110"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="父级菜单" path="parentId">
        <NTreeSelect
          v-model:value="form.parentId"
          :options="parentOptions"
          clearable
          default-expand-all
          placeholder="留空表示一级菜单"
        />
      </NFormItem>
      <NFormItem label="菜单标题" path="title">
        <NInput v-model:value="form.title" placeholder="请输入菜单标题" />
      </NFormItem>
      <NFormItem label="菜单路径" path="path">
        <NInput v-model:value="form.path" placeholder="如 /system-management/admin" />
      </NFormItem>
      <NFormItem label="图标" path="icon">
        <NInput v-model:value="form.icon" placeholder="Iconify 图标名称，如 carbon:dashboard" />
      </NFormItem>
      <NFormItem label="排序" path="order">
        <NInputNumber v-model:value="orderValue" :min="0" :precision="0" class="w-full" placeholder="数值越小越靠前" />
      </NFormItem>
      <NFormItem label="权限编码" path="permissionCode">
        <NSelect
          v-model:value="form.permissionCode"
          :options="permissionOptions"
          :loading="permissionLoading"
          clearable
          filterable
          placeholder="留空表示登录即可见"
        />
      </NFormItem>
      <NFormItem label="仅根管理员" path="isRootOnly">
        <NSwitch v-model:value="form.isRootOnly" />
        <span class="ml-12px text-12px text-#999">开启后普通管理员即使拥有权限编码也看不到该菜单</span>
      </NFormItem>
      <NFormItem v-if="editing" label="状态" path="isActive">
        <NSwitch v-model:value="form.isActive" />
      </NFormItem>
    </NForm>
    <NAlert v-if="selectedPermission?.isProtected && !form.isRootOnly" type="error" :bordered="false">
      该权限为受保护权限，必须同时开启“仅根管理员”。
    </NAlert>
    <NAlert v-else-if="selectedPermission" type="info" :bordered="false">
      {{ selectedPermission.name }}（{{ selectedPermission.category }}）·
      {{ selectedPermission.description || '暂无描述' }}
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
