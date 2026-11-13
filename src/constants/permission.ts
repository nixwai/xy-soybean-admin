/** 动态权限编码，与后端 PermissionCode 常量保持一致。 */
export const PERMISSION_CODE = {
  /** 查看管理员、角色和权限变更审计。 */
  AUDIT_READ: 'system.audit.read',
  /** 查看自己的素材文件夹。 */
  ASSET_FOLDER_READ: 'asset.folder.read',
  /** 查看和管理全部拥有者的素材文件夹。 */
  ASSET_FOLDER_ALL: 'asset.folder.all',
  /** 创建素材文件夹。 */
  ASSET_FOLDER_CREATE: 'asset.folder.create',
  /** 更新素材文件夹。 */
  ASSET_FOLDER_UPDATE: 'asset.folder.update',
  /** 删除素材文件夹。 */
  ASSET_FOLDER_DELETE: 'asset.folder.delete'
} as const;

/** 后端动态权限编码。 */
export type PermissionCode = (typeof PERMISSION_CODE)[keyof typeof PERMISSION_CODE];
