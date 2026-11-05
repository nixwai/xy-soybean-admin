/** 系统管理模块的动态权限编码，与后端 PermissionCode 常量保持一致。 */
export const PERMISSION_CODE = {
  /** 查看管理员、角色和权限变更审计。 */
  AUDIT_READ: 'system.audit.read'
} as const;

/** 后端动态权限编码。 */
export type PermissionCode = (typeof PERMISSION_CODE)[keyof typeof PERMISSION_CODE];
