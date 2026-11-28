/** 动态权限编码，与后端 PermissionCode 常量保持一致。 */
export const PERMISSION_CODE = {
  /** 查看管理员、角色和权限变更审计。 */
  AUDIT_READ: 'system.audit.read',
  /** 查看微信用户列表。 */
  USER_READ: 'system.user.read',
  /** 更新微信用户资料或启用状态。 */
  USER_UPDATE: 'system.user.update',
  /** 查看自己的素材文件夹。 */
  ASSET_FOLDER_READ: 'asset.folder.read',
  /** 查看和管理全部拥有者的素材文件夹。 */
  ASSET_FOLDER_ALL: 'asset.folder.all',
  /** 创建素材文件夹。 */
  ASSET_FOLDER_CREATE: 'asset.folder.create',
  /** 更新素材文件夹。 */
  ASSET_FOLDER_UPDATE: 'asset.folder.update',
  /** 删除素材文件夹。 */
  ASSET_FOLDER_DELETE: 'asset.folder.delete',
  /** 查看素材图片。 */
  ASSET_IMAGE_READ: 'asset.image.read',
  /** 上传素材图片。 */
  ASSET_IMAGE_UPLOAD: 'asset.image.upload',
  /** 重命名素材图片。 */
  ASSET_IMAGE_UPDATE: 'asset.image.update',
  /** 删除素材图片。 */
  ASSET_IMAGE_DELETE: 'asset.image.delete',
  /** 移动素材图片。 */
  ASSET_IMAGE_MOVE: 'asset.image.move'
} as const;

/** 后端动态权限编码。 */
export type PermissionCode = (typeof PERMISSION_CODE)[keyof typeof PERMISSION_CODE];
