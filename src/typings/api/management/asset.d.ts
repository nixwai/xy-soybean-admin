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
