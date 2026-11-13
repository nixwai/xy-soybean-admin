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
}
