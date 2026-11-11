declare namespace ApiManagement {
  /** 后端布尔字段在 MySQL tinyint 存储下可能返回 0/1，归一化前的原始类型。 */
  type Booleanish = boolean | 0 | 1;

  /** 页码分页查询参数。 */
  interface PageQuery {
    page: number;
    pageSize: number;
  }

  /** 页码分页响应，携带完整分页元数据。 */
  interface PageResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  /** 不分页列表响应。 */
  interface ListResponse<T> {
    items: T[];
    total: number;
  }

  /** 只含主键的请求体，用于权限启停、菜单启停和删除。 */
  interface IdRequest {
    id: string;
  }

  /** 需要复核当前登录管理员密码的请求体。 */
  interface SensitiveIdRequest extends IdRequest {
    currentPassword?: string;
  }

  /** 管理员公开信息。 */
  interface Admin {
    id: string;
    username: string;
    isActive: boolean;
    /** 是否为根管理员，根管理员拥有系统全部权限。 */
    isRoot: boolean;
    roleIds: string[];
    createdAt: string;
    updatedAt: string;
  }

  /** 创建管理员请求，密码字段为 RSA-OAEP-SHA256 密文。 */
  interface AdminCreateRequest {
    username: string;
    password: string;
    isRoot?: boolean;
    /** 创建根管理员时必填的当前登录管理员密码密文。 */
    currentPassword?: string;
  }

  /** 更新管理员请求，修改密码或根管理员状态时必须携带当前密码密文。 */
  interface AdminUpdateRequest {
    id: string;
    username?: string;
    password?: string;
    isActive?: boolean;
    isRoot?: boolean;
    currentPassword?: string;
  }

  /** 重置管理员密码请求。 */
  interface AdminResetPasswordRequest {
    id: string;
    password: string;
    currentPassword: string;
  }

  /** 管理员与角色的绑定关系请求。 */
  interface AdminRoleBindingRequest {
    adminId: string;
    roleId: string;
  }

  /** 角色公开信息。 */
  interface Role {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    /** 是否由系统维护，系统角色不参与普通角色的编码修改。 */
    isSystem: boolean;
    /** 是否受保护，受保护角色禁止删除和停用。 */
    isProtected: boolean;
    permissionIds: string[];
    deletedAt: string | null;
  }

  /** 创建角色请求，编码创建后不可修改。 */
  interface RoleCreateRequest {
    code: string;
    name: string;
    /** 传 null 表示清空描述。 */
    description?: string | null;
  }

  /** 更新角色请求，未提供的字段保持原值。 */
  interface RoleUpdateRequest {
    id: string;
    name?: string;
    /** 传 null 表示清空描述。 */
    description?: string | null;
    isActive?: boolean;
  }

  /** 角色与权限的绑定关系请求。 */
  interface RolePermissionBindingRequest {
    roleId: string;
    permissionId: string;
  }

  /** 权限目录中的权限记录。 */
  interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    /** 权限分类标识，同时作为分组依据。 */
    category: string;
    /** 是否允许绑定给普通角色。 */
    isAssignable: boolean;
    /** 是否为受保护权限，受保护权限仅根管理员可用。 */
    isProtected: boolean;
    isActive: boolean;
  }

  /** 按分类分组的权限列表。 */
  interface PermissionGroup {
    category: string;
    categoryName: string;
    permissions: Permission[];
  }

  /** 分组权限目录响应。 */
  interface PermissionGroupListResponse {
    groups: PermissionGroup[];
    total: number;
  }

  /** 菜单记录，字段与 /menu/list 返回值保持一致。 */
  interface Menu {
    id: string;
    menuKey: string;
    parentKey: string | null;
    title: string;
    path: string;
    order: number;
    permissionCode: string | null;
    isRootOnly: boolean;
    isActive: boolean;
    permissionAvailable: boolean;
  }

  /** 后端仅允许更新菜单展示标题、排序和启用状态。 */
  interface MenuUpdateRequest {
    id: string;
    title?: string;
    order?: number;
    isActive?: boolean;
  }

  /** 审计记录。 */

  interface AuditLog {
    id: string;
    actorAdminId: string | null;
    action: string;
    actionLabel: string;
    resourceType: string;
    resourceTypeLabel: string;
    targetId: string | null;
    details: Record<string, unknown> | null;
    succeeded: boolean;
    createdAt: string;
    updatedAt: string;
  }

  /** 审计记录游标分页查询参数。 */
  interface AuditQuery {
    cursor?: string;
    limit: number;
  }

  /** 审计记录游标分页响应，不返回总数。 */
  interface AuditListResponse {
    items: AuditLog[];
    nextCursor: string | null;
    hasMore: boolean;
  }
  interface AssetUploadLimits {
    maxFiles: number;
    maxFileSize: number;
    maxBatchSize: number;
  }
  interface AssetOwner {
    id: string;
    username: string;
    isActive: boolean;
  }
  /** 素材文件夹。 */
  interface AssetFolder {
    id: string;
    name: string;
    parentId: string | null;
    createdByAdminId: string;
    ownerId: string;
    imageCount: number;
    createdAt: string;
    updatedAt: string;
  }
  interface AssetFolderCreateRequest {
    name: string;
    parentId?: string | null;
    ownerId?: string;
  }
  interface AssetFolderUpdateRequest {
    id: string;
    name: string;
    ownerId?: string;
  }
  interface Asset {
    id: string;
    folderId: string | null;
    originalName: string;
    url: string;
    storageKey: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    createdByAdminId: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }
  interface AssetQuery extends PageQuery {
    unclassified?: boolean;
    folderId?: string;
    keyword?: string;
    ownerId?: string;
  }
  interface BatchAssetUploadResponse {
    success: Asset[];
    failed: Array<{ filename: string; reason: string }>;
    totalCount: number;
    successCount: number;
  }
}
