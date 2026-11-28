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

/** 素材文件夹树查询表单模型。 */
export interface AssetTreeQueryModel {
  /** 匹配文件夹名称或归属账号名称的关键词。 */
  keyword: string;
}

/** 素材图片列表查询上下文，决定使用直属浏览还是范围搜索。 */
export interface AssetImageQueryContext {
  /** 当前选中的文件夹树节点，未选中时为 null。 */
  node: AssetTreeOption | null;
  /** 是否处于全部账号查看范围。 */
  scopeAll: boolean;
  /** 已提交的文件名关键词，空字符串表示浏览态。 */
  keyword: string;
}

/** 素材图片列表分页状态。 */
export interface AssetImagePaginationState {
  /** 当前页码。 */
  page: number;
  /** 每页数量。 */
  pageSize: number;
  /** 总数量。 */
  total: number;
}

/** 图片列表与详情共用的操作键。 */
export type AssetImageAction = 'rename' | 'move' | 'copy' | 'delete';

/** 可显示在操作按钮或右键菜单中的选项。 */
export type AssetImageActionOption = {
  key: AssetImageAction;
  label: string;
};
