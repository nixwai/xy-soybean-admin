import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stringify } from 'qs';

const mocks = vi.hoisted(() => ({
  fetchAdminList: vi.fn(),
  fetchAuditList: vi.fn(),
  fetchAuditOptions: vi.fn(),
  fetchAssetFolderTree: vi.fn(),
  fetchAssetFolderTreeAll: vi.fn(),
  fetchMenuList: vi.fn(),
  fetchRoleList: vi.fn(),
  fetchUserList: vi.fn()
}));

vi.mock('@/hooks/business/auth', () => ({
  useAuth: () => ({ hasAuth: () => true })
}));

vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({ userInfo: { userId: '1' } })
}));

vi.mock('@/service/api', () => ({
  fetchAdminList: mocks.fetchAdminList,
  fetchAuditList: mocks.fetchAuditList,
  fetchAuditOptions: mocks.fetchAuditOptions,
  fetchAssetFolderTree: mocks.fetchAssetFolderTree,
  fetchAssetFolderTreeAll: mocks.fetchAssetFolderTreeAll,
  fetchMenuList: mocks.fetchMenuList,
  fetchRoleList: mocks.fetchRoleList,
  fetchUserList: mocks.fetchUserList
}));

import { useAssetFolderTree } from '@/views/operation-management/asset/hooks/use-asset-folder-tree';
import { filterAssetTree } from '@/views/operation-management/asset/utils/asset-tree';
import {
  ADMIN_STATUS_OPTIONS,
  ADMIN_TYPE_OPTIONS,
  createDefaultAdminQuery
} from '@/views/system-management/admin/config/constants';
import { buildAdminListParams, useAdminQuery } from '@/views/system-management/admin/hooks/use-admin-query';
import { createDefaultAuditQuery } from '@/views/system-management/audit/config/constants';
import { useAuditOptions } from '@/views/system-management/audit/hooks/use-audit-options';
import { buildAuditListParams, useAuditQuery } from '@/views/system-management/audit/hooks/use-audit-query';
import {
  MENU_PERMISSION_OPTIONS,
  MENU_STATUS_OPTIONS,
  createDefaultMenuQuery
} from '@/views/system-management/menu/config/constants';
import { useMenuQuery } from '@/views/system-management/menu/hooks/use-menu-query';
import { filterMenuTree } from '@/views/system-management/menu/utils/menu-filter';
import {
  PERMISSION_STATUS_OPTIONS,
  createDefaultPermissionQuery
} from '@/views/system-management/permission/config/constants';
import { filterPermissionGroups } from '@/views/system-management/permission/utils/permission-filter';
import {
  ROLE_STATUS_OPTIONS,
  ROLE_TYPE_OPTIONS,
  createDefaultRoleQuery
} from '@/views/system-management/role/config/constants';
import { buildRoleListParams } from '@/views/system-management/role/hooks/use-role-query';
import { USER_STATUS_OPTIONS, createDefaultUserQuery } from '@/views/system-management/user/config/constants';
import { buildUserListParams } from '@/views/system-management/user/hooks/use-user-query';

describe('后台列表搜索', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchAdminList.mockResolvedValue({ data: { items: [], total: 0 }, error: null });
    mocks.fetchAuditList.mockResolvedValue({ data: { items: [], nextCursor: null, hasMore: false }, error: null });
    mocks.fetchAuditOptions.mockResolvedValue({
      data: {
        actions: [{ label: '创建管理员', value: 'admin.create' }],
        resources: [{ label: '管理员', value: 'admin' }],
        results: [
          { label: '成功', value: 'succeeded' },
          { label: '失败', value: 'failed' }
        ]
      },
      error: null
    });
    mocks.fetchAssetFolderTree.mockResolvedValue({ data: { owners: [] }, error: null });
    mocks.fetchMenuList.mockResolvedValue({ data: { items: [], total: 0 }, error: null });
    mocks.fetchRoleList.mockResolvedValue({ data: { items: [], total: 0 }, error: null });
    mocks.fetchUserList.mockResolvedValue({ data: { items: [], total: 0 }, error: null });
  });

  it('将列表表单值按接口契约直接传递，并保留有效筛选值', () => {
    expect(
      buildAdminListParams(2, 10, {
        id: 'admin-1',
        username: 'root',
        statusFilter: 'inactive',
        typeFilter: 'root'
      })
    ).toEqual({ page: 2, pageSize: 10, id: 'admin-1', username: 'root', isActive: false, isRoot: true });
    expect(
      buildRoleListParams(1, 20, {
        code: 'operator',
        name: '运营人员',
        statusFilter: null,
        typeFilter: null
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      code: 'operator',
      name: '运营人员',
      isActive: undefined,
      isSystem: undefined
    });
    expect(
      buildUserListParams(1, 20, {
        id: '1',
        openId: 'wx-open',
        unionId: '',
        nickname: '小明',
        statusFilter: 'active'
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      id: '1',
      openId: 'wx-open',
      unionId: '',
      nickname: '小明',
      isActive: true
    });
    expect(
      buildAuditListParams({
        actorAdminId: 'admin-1',
        targetId: 'target-1',
        actionFilter: 'admin.update',
        resourceTypeFilter: 'admin',
        resultFilter: 'failed',
        createdRange: null
      })
    ).toEqual({
      actorAdminId: 'admin-1',
      targetId: 'target-1',
      action: 'admin.update',
      resourceType: 'admin',
      succeeded: false,
      createdFrom: undefined,
      createdTo: undefined
    });
  });

  it('请求序列化保留接口支持的 false 和 0', () => {
    expect(stringify({ disabled: false, page: 0 })).toBe('disabled=false&page=0');
  });

  it('审计筛选项从接口加载并保留后端返回值', async () => {
    const options = useAuditOptions();

    await options.loadOptions();

    expect(options.actionOptions.value).toEqual([{ label: '创建管理员', value: 'admin.create' }]);
    expect(options.resourceOptions.value).toEqual([{ label: '管理员', value: 'admin' }]);
    expect(options.resultOptions.value).toEqual([
      { label: '成功', value: 'succeeded' },
      { label: '失败', value: 'failed' }
    ]);
    expect(options.optionsLoading.value).toBe(false);
  });

  it('下拉筛选不提供 all 伪选项，清空后使用 null', () => {
    const optionSets = [
      ADMIN_STATUS_OPTIONS,
      ADMIN_TYPE_OPTIONS,
      MENU_STATUS_OPTIONS,
      MENU_PERMISSION_OPTIONS,
      PERMISSION_STATUS_OPTIONS,
      ROLE_STATUS_OPTIONS,
      ROLE_TYPE_OPTIONS,
      USER_STATUS_OPTIONS
    ];

    expect(optionSets.flat().map(option => option.value)).not.toContain('all');
  });

  it('所有列表查询表单默认值都不包含 undefined', () => {
    expect(createDefaultAdminQuery()).toEqual({ id: '', username: '', statusFilter: null, typeFilter: null });
    expect(createDefaultAuditQuery()).toEqual({
      actorAdminId: '',
      targetId: '',
      actionFilter: null,
      resourceTypeFilter: null,
      resultFilter: null,
      createdRange: null
    });
    expect(createDefaultMenuQuery()).toEqual({
      title: '',
      menuKey: '',
      path: '',
      permissionCode: '',
      statusFilter: null,
      permissionFilter: null
    });
    expect(createDefaultPermissionQuery()).toEqual({
      code: '',
      name: '',
      description: '',
      categoryFilter: '',
      statusFilter: null
    });
    expect(createDefaultRoleQuery()).toEqual({ code: '', name: '', statusFilter: null, typeFilter: null });
    expect(createDefaultUserQuery()).toEqual({
      id: '',
      openId: '',
      unionId: '',
      nickname: '',
      statusFilter: null
    });
  });

  it('查询和重置分页列表都回到第一页并使用当前条件', async () => {
    const query = useAdminQuery();
    query.query.username = 'operator';
    query.query.statusFilter = 'active';

    await query.changePage(3);
    expect(mocks.fetchAdminList).toHaveBeenLastCalledWith({
      page: 3,
      pageSize: 20,
      id: '',
      username: 'operator',
      isActive: true,
      isRoot: undefined
    });

    await query.search();
    expect(query.page.value).toBe(1);
    expect(mocks.fetchAdminList).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      id: '',
      username: 'operator',
      isActive: true,
      isRoot: undefined
    });

    await query.reset();
    expect(query.query).toMatchObject({
      id: '',
      username: '',
      statusFilter: null,
      typeFilter: null
    });
    expect(mocks.fetchAdminList).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      id: '',
      username: '',
      isActive: undefined,
      isRoot: undefined
    });
  });

  it('非分页菜单搜索和重置不再次请求网络', async () => {
    const query = useMenuQuery();
    await query.load();
    expect(mocks.fetchMenuList).toHaveBeenCalledOnce();

    query.query.title = '用户';
    await query.search();
    expect(mocks.fetchMenuList).toHaveBeenCalledOnce();
    expect(query.filteredItems.value).toEqual([]);

    await query.reset();
    expect(mocks.fetchMenuList).toHaveBeenCalledOnce();
    expect(query.filteredItems.value).toEqual([]);
  });

  it('菜单搜索按独立字段匹配，并保留命中的祖先节点', () => {
    const tree = [
      {
        id: '1',
        menuKey: 'system',
        parentKey: null,
        title: '系统管理',
        path: '/system',
        order: 1,
        permissionCode: null,
        isRootOnly: false,
        isActive: true,
        permissionAvailable: true,
        children: [
          {
            id: '2',
            menuKey: 'system-user',
            parentKey: 'system',
            title: '用户管理',
            path: '/system/user',
            order: 1,
            permissionCode: 'system:user:read',
            isRootOnly: false,
            isActive: true,
            permissionAvailable: true
          }
        ]
      }
    ] as unknown as import('@/views/system-management/menu/typings').MenuTreeNode[];

    expect(
      filterMenuTree(tree, {
        title: '',
        menuKey: '',
        path: '',
        permissionCode: 'system:user:read',
        statusFilter: null,
        permissionFilter: null
      })
    ).toMatchObject([{ menuKey: 'system', children: [{ menuKey: 'system-user' }] }]);
  });

  it('权限搜索按编码、名称、描述和分类分别过滤', () => {
    const groups = [
      {
        category: 'system',
        categoryName: '系统管理',
        permissions: [
          {
            id: '1',
            code: 'system:user:read',
            name: '用户查询',
            description: null,
            category: 'system',
            isAssignable: true,
            isProtected: false,
            isActive: true
          },
          {
            id: '2',
            code: 'system:user:update',
            name: '用户编辑',
            description: '编辑用户',
            category: 'system',
            isAssignable: true,
            isProtected: false,
            isActive: false
          }
        ]
      }
    ] satisfies ApiManagement.PermissionGroup[];

    expect(
      filterPermissionGroups(groups, {
        code: '',
        name: '编辑',
        description: '',
        categoryFilter: '',
        statusFilter: 'inactive'
      })
    ).toMatchObject([{ category: 'system', permissions: [{ id: '2' }] }]);
    expect(
      filterPermissionGroups(groups, {
        code: '',
        name: '',
        description: '',
        categoryFilter: 'missing',
        statusFilter: null
      })
    ).toEqual([]);
  });

  it('素材树空关键词筛选视为未设置并保留完整树', () => {
    const source = [
      { key: 'owner:1', label: '账号A', nodeType: 'owner', ownerId: '1' },
      { key: 'owner:2', label: '账号B', nodeType: 'owner', ownerId: '2' }
    ] as unknown as import('@/views/operation-management/asset/typings').AssetTreeOption[];

    expect(filterAssetTree(source, { keyword: '' })).toEqual(source);
  });

  it('素材树使用单一关键词匹配文件夹或账号名称', () => {
    const source = [
      {
        key: 'owner:1',
        label: '账号A',
        nodeType: 'owner',
        ownerId: '1',
        children: [{ key: 'folder-1', label: '素材', nodeType: 'folder', ownerId: '1' }]
      },
      { key: 'owner:2', label: '账号B', nodeType: 'owner', ownerId: '2' }
    ] as unknown as import('@/views/operation-management/asset/typings').AssetTreeOption[];

    expect(filterAssetTree(source, { keyword: '素材' })).toMatchObject([
      { key: 'owner:1', children: [{ key: 'folder-1', label: '素材' }] }
    ]);
    expect(filterAssetTree(source, { keyword: '账号B' })).toMatchObject([{ key: 'owner:2', label: '账号B' }]);
  });

  it('素材树关键词输入后立即过滤且不重复请求网络', async () => {
    const owners = [
      { owner: { id: '1', username: '账号A' }, children: [{ id: '10', name: '素材', children: [] }] },
      { owner: { id: '2', username: '账号B' }, children: [] }
    ] as unknown as ApiManagement.AssetFolderOwnerTree[];
    mocks.fetchAssetFolderTree.mockResolvedValue({ data: { owners }, error: null });

    const tree = useAssetFolderTree();
    await tree.loadTree();
    expect(mocks.fetchAssetFolderTree).toHaveBeenCalledOnce();

    tree.query.keyword = '素材';
    expect(tree.treeData.value).toMatchObject([{ key: '10', label: '素材' }]);
    expect(mocks.fetchAssetFolderTree).toHaveBeenCalledOnce();
  });

  it('审计日志搜索按操作者 ID 和目标 ID 映射，并在搜索时重置游标', async () => {
    const query = useAuditQuery();
    query.query.actorAdminId = 'admin-1';
    query.query.resultFilter = 'failed';

    await query.search();
    expect(mocks.fetchAuditList).toHaveBeenLastCalledWith({
      limit: 20,
      actorAdminId: 'admin-1',
      targetId: '',
      action: null,
      resourceType: null,
      succeeded: false,
      createdFrom: undefined,
      createdTo: undefined,
      cursor: undefined
    });
    expect(query.nextCursor.value).toBeNull();

    await query.reset();
    expect(mocks.fetchAuditList).toHaveBeenLastCalledWith({
      limit: 20,
      actorAdminId: '',
      targetId: '',
      action: null,
      resourceType: null,
      succeeded: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      cursor: undefined
    });
  });
});
