import type {
  RoleFormModel,
  RolePermissionAssignModel,
  RoleQueryModel,
  RoleStatusFilter,
  RoleTypeFilter
} from '../typings';

/** 角色列表的默认分页大小。 */
export const ROLE_PAGE_SIZE = 20;

/** 角色列表状态筛选选项。 */
export const ROLE_STATUS_OPTIONS: Array<{ label: string; value: RoleStatusFilter }> = [
  { label: '已启用', value: 'active' },
  { label: '已停用', value: 'inactive' }
];

/** 角色列表类型筛选选项。 */
export const ROLE_TYPE_OPTIONS: Array<{ label: string; value: RoleTypeFilter }> = [
  { label: '系统角色', value: 'system' },
  { label: '自定义角色', value: 'custom' }
];

/** 创建角色列表查询条件默认值。 */
export function createDefaultRoleQuery(): RoleQueryModel {
  return { code: '', name: '', statusFilter: null, typeFilter: null };
}

/** 后端角色编码规则：以小写字母开头，允许小写字母、数字、冒号、下划线和连字符。 */
export const ROLE_CODE_PATTERN = /^[a-z][a-z0-9:_-]*$/;

/** 角色表单校验规则，与后端编码格式和长度约束保持一致。 */
export const ROLE_FORM_RULES: Record<string, App.Global.FormRule[]> = {
  code: [
    { required: true, message: '请输入角色编码', trigger: ['input', 'blur'] },
    {
      pattern: ROLE_CODE_PATTERN,
      message: '以小写字母开头，仅允许小写字母、数字、冒号、下划线和连字符',
      trigger: ['input', 'blur']
    },
    { max: 64, message: '角色编码不能超过 64 个字符', trigger: ['input', 'blur'] }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: ['input', 'blur'] },
    { max: 128, message: '角色名称不能超过 128 个字符', trigger: ['input', 'blur'] }
  ],
  description: [{ max: 255, message: '角色描述不能超过 255 个字符', trigger: ['input', 'blur'] }]
};

/** 创建独立的角色编辑表单。 */
export function createRoleForm(): RoleFormModel {
  return { code: '', name: '', description: '', isActive: true };
}

/** 将角色记录转换为编辑表单。 */
export function toRoleForm(row: ApiManagement.Role): RoleFormModel {
  return {
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    isActive: row.isActive
  };
}

/** 创建独立的角色权限分配表单。 */
export function createRolePermissionAssignForm(): RolePermissionAssignModel {
  return { permissionIds: [] };
}
