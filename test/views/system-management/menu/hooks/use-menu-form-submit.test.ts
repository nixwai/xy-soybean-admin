import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateMenu } from '@/service/api';
import { useMenuFormSubmit } from '@/views/system-management/menu/hooks/use-menu-form-submit';

vi.mock('@/service/api', () => ({
  updateMenu: vi.fn()
}));

const updateMock = vi.mocked(updateMenu);
const response = { data: null, error: null, response: null } as never;
vi.stubGlobal('window', { $message: { success: vi.fn() } });
const menu = {
  id: 'menu-1',
  menuKey: 'system',
  parentKey: null,
  title: '旧标题',
  path: '/system',
  order: 1,
  permissionCode: null,
  isRootOnly: false,
  isActive: true,
  permissionAvailable: true
} as ApiManagement.Menu;

describe('useMenuFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMock.mockResolvedValue(response);
  });

  it('打开编辑时复制表单并提交归一化后的数据', async () => {
    const onSuccess = vi.fn();
    const { form, openEdit, submit, showModal } = useMenuFormSubmit({ onSuccess });

    openEdit(menu);
    form.value.title = '  新标题  ';
    await submit();

    expect(updateMock).toHaveBeenCalledWith({ id: 'menu-1', title: '新标题', order: 1, isActive: true });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(showModal.value).toBe(false);
  });

  it('请求失败时保留编辑状态以便重试', async () => {
    updateMock.mockResolvedValueOnce({ data: null, error: new Error('failed'), response: null } as never);
    const { openEdit, submit, showModal } = useMenuFormSubmit({ onSuccess: vi.fn() });

    openEdit(menu);
    await submit();

    expect(showModal.value).toBe(true);
    expect(updateMock).toHaveBeenCalledOnce();
  });
});
