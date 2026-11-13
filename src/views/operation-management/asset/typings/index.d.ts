import type { TreeOption } from 'naive-ui';

/** 素材文件夹树节点，账号根节点与文件夹节点共用同一渲染结构。 */
export type AssetTreeOption = Omit<TreeOption, 'key' | 'label' | 'children'> & {
  /** 节点标识，文件夹使用后端主键，账号根节点使用 owner: 前缀。 */
  key: string;
  /** 节点展示名称。 */
  label: string;
  /** 节点类型。 */
  nodeType: 'owner' | 'folder';
  /** 节点所属账号标识。 */
  ownerId: string;
  /** 子节点。 */
  children?: AssetTreeOption[];
};

/** 文件夹表单弹窗的提交模式。 */
export type AssetFolderFormMode = 'create' | 'rename';

/** 素材文件夹表单模型，仅承载用户可编辑的字段。 */
export interface AssetFolderFormModel {
  /** 文件夹名称。 */
  name: string;
  /** 全局新增时的目标拥有者 ID。 */
  ownerId: string;
}
