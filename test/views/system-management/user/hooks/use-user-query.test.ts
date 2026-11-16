import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders } from 'axios';
import { fetchUserList } from '@/service/api';
import { useUserQuery } from '@/views/system-management/user/hooks/use-user-query';

vi.mock('@/service/api', () => ({
  fetchUserList: vi.fn()
}));

const fetchUserListMock = vi.mocked(fetchUserList);
const user = {
  id: 'user-1',
  openId: 'openid-1',
  unionId: null,
  nickname: '小明',
  avatarUrl: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: '2026-11-15T00:00:00.000Z',
  updatedAt: '2026-11-15T00:00:00.000Z'
} satisfies ApiManagement.User;
const userListData = {
  items: [user],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false
};
const userListResponse = {
  data: userListData,
  error: null,
  response: {
    data: { code: 200, data: userListData },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() }
  }
} satisfies Awaited<ReturnType<typeof fetchUserList>>;

beforeEach(() => {
  vi.clearAllMocks();
  fetchUserListMock.mockResolvedValue(userListResponse);
});

describe('useUserQuery', () => {
  it('查询时传递去空格关键词和状态筛选', async () => {
    const { keyword, statusFilter, page, pageSize, items, total, load } = useUserQuery();
    keyword.value = '  openid-1  ';
    statusFilter.value = 'inactive';
    page.value = 2;
    pageSize.value = 50;

    await load();

    expect(fetchUserListMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 50,
      keyword: 'openid-1',
      isActive: false
    });
    expect(items.value).toEqual([user]);
    expect(total.value).toBe(1);
  });

  it('执行搜索时回到第一页并保留当前筛选条件', async () => {
    const { keyword, statusFilter, page, search } = useUserQuery();
    keyword.value = '昵称';
    statusFilter.value = 'active';
    page.value = 4;

    await search();

    expect(page.value).toBe(1);
    expect(fetchUserListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      keyword: '昵称',
      isActive: true
    });
  });

  it('重置搜索条件并回到第一页', async () => {
    const { keyword, statusFilter, page, reset } = useUserQuery();
    keyword.value = '待清理';
    statusFilter.value = 'inactive';
    page.value = 3;

    await reset();

    expect(keyword.value).toBe('');
    expect(statusFilter.value).toBe('all');
    expect(page.value).toBe(1);
    expect(fetchUserListMock).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });
});
