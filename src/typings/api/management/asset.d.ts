declare namespace ApiManagement {
  /** 文件夹公开字段，账号信息按场景由平铺名称或账号对象承载。 */
  interface AssetFolderBase {
    id: string;
    name: string;
    parentId: string | null;
    ownerId: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
  }
  /** 单个文件夹，写操作结果附带账号名用于回显。 */
  interface AssetFolder extends AssetFolderBase {
    ownerUsername: string;
    creatorUsername: string;
  }
  /** 文件夹归属账号。 */
  interface AssetFolderAccount {
    id: string;
    username: string;
  }
  /** 文件夹树节点。 */
  interface AssetFolderTreeNode extends AssetFolderBase {
    owner: AssetFolderAccount;
    creator: AssetFolderAccount;
    children: AssetFolderTreeNode[];
  }
  /** 账号及其顶层文件夹。 */
  interface AssetFolderOwnerTree {
    owner: AssetFolderAccount;
    children: AssetFolderTreeNode[];
  }
  /** 文件夹树响应。 */
  interface AssetFolderTreeResponse {
    owners: AssetFolderOwnerTree[];
  }
  interface AssetFolderCreateRequest {
    name: string;
    parentId?: string;
    ownerId?: string;
  }
  interface AssetFolderUpdateRequest {
    id: string;
    name: string;
  }
  /** 素材图片公开信息。 */
  interface AssetImage {
    id: string;
    folderId: string;
    ownerId: string;
    creatorId: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    width: number;
    height: number;
    createdAt: string;
    updatedAt: string;
  }
  /** 素材图片分页查询参数。 */
  interface AssetImageListQuery extends PageQuery {
    folderId: string;
  }
  /** 素材图片搜索参数，范围优先级为文件夹、账号、查看范围。 */
  interface AssetImageSearchQuery extends PageQuery {
    /** 图片原始文件名关键词。 */
    keyword: string;
    /** 限定为该文件夹及其全部子孙文件夹。 */
    folderId?: string;
    /** 限定为该账号名下全部文件夹。 */
    ownerId?: string;
    /** 未限定范围时是否覆盖全部账号。 */
    all?: boolean;
  }
  /** 重命名素材图片请求。 */
  interface AssetImageUpdateRequest {
    id: string;
    originalName: string;
  }
  /** 删除素材图片请求。 */
  interface AssetImageSoftDeleteRequest {
    id: string;
  }
  /** 移动素材图片请求。 */
  interface AssetImageMoveRequest {
    id: string;
    folderId: string;
  }
  /** 素材图片分页响应。 */
  interface AssetImagePageResponse extends PageResponse<AssetImage> {}
  /** 单个上传失败项。 */
  interface AssetImageUploadFailure {
    filename: string;
    reason: string;
  }
  /** 素材图片批量上传响应。 */
  interface AssetImageUploadResponse {
    success: AssetImage[];
    failed: AssetImageUploadFailure[];
    totalCount: number;
    successCount: number;
  }
}
