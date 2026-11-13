import type { AssetFolderFormModel } from '../typings';

/** 文件夹名称长度上限，与后端字段长度一致。 */
export const ASSET_FOLDER_NAME_MAX_LENGTH = 128;

/** 管理员 ID 与后端主键格式保持一致。 */
export const ASSET_FOLDER_OWNER_ID_PATTERN = /^[1-9][0-9]*$/;

/** 文件夹名称校验规则，纯空白名称视为未填写。 */
const ASSET_FOLDER_NAME_RULES: App.Global.FormRule[] = [
  {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule: unknown, value: string) => (value?.trim() ? true : new Error('请输入文件夹名称'))
  },
  {
    max: ASSET_FOLDER_NAME_MAX_LENGTH,
    message: `文件夹名称不能超过 ${ASSET_FOLDER_NAME_MAX_LENGTH} 个字符`,
    trigger: ['input', 'blur']
  }
];

/** 全局新增时的拥有者 ID 校验规则。 */
const ASSET_FOLDER_OWNER_ID_RULES: App.Global.FormRule[] = [
  {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule: unknown, value: string) => (value?.trim() ? true : new Error('请输入拥有者 ID'))
  },
  {
    trigger: ['input', 'blur'],
    validator: (_rule: unknown, value: string) =>
      ASSET_FOLDER_OWNER_ID_PATTERN.test(value?.trim() ?? '') ? true : new Error('拥有者 ID 必须为正整数')
  }
];

/** 文件夹表单校验规则。 */
export const ASSET_FOLDER_FORM_RULES: Record<string, App.Global.FormRule[]> = {
  name: ASSET_FOLDER_NAME_RULES
};

/** 全局新增文件夹时的表单校验规则。 */
export const ASSET_FOLDER_GLOBAL_CREATE_RULES: Record<string, App.Global.FormRule[]> = {
  name: ASSET_FOLDER_NAME_RULES,
  ownerId: ASSET_FOLDER_OWNER_ID_RULES
};

/** 创建独立的文件夹编辑表单。 */
export function createAssetFolderForm(ownerId = ''): AssetFolderFormModel {
  return { name: '', ownerId };
}
