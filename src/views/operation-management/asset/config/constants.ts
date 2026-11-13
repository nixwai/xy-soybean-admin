import type { AssetFolderFormModel } from '../typings';

/** 文件夹名称长度上限，与后端字段长度一致。 */
export const ASSET_FOLDER_NAME_MAX_LENGTH = 128;

/** 文件夹表单校验规则，纯空白名称视为未填写。 */
export const ASSET_FOLDER_FORM_RULES: Record<string, App.Global.FormRule[]> = {
  name: [
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
  ]
};

/** 创建独立的文件夹编辑表单。 */
export function createAssetFolderForm(): AssetFolderFormModel {
  return { name: '' };
}
