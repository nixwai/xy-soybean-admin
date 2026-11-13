import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAssetFolder, updateAssetFolder } from '@/service/api';
import { createAssetFolderForm } from '@/views/operation-management/asset/config/constants';
import { useAssetFolderFormSubmit } from '@/views/operation-management/asset/hooks/use-asset-folder-form-submit';
import type { AssetTreeOption } from '@/views/operation-management/asset/typings';

vi.mock('@/service/api', () => ({
  createAssetFolder: vi.fn(),
  updateAssetFolder: vi.fn()
}));

const createMock = vi.mocked(createAssetFolder);
const updateMock = vi.mocked(updateAssetFolder);
const successMock = vi.fn();
vi.stubGlobal('window', { $message: { success: successMock } });

const ownerNode: AssetTreeOption = {
  key: 'owner:1',
  label: '账号A',
  nodeType: 'owner',
  ownerId: '1'
};

describe('useAssetFolderFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMock.mockResolvedValue({ data: null, error: null, response: null } as never);
    updateMock.mockResolvedValue({ data: null, error: null, response: null } as never);
    successMock.mockClear();
  });

  it('创建彼此独立且包含拥有者字段的表单', () => {
    const first = createAssetFolderForm();
    const second = createAssetFolderForm('2');

    first.name = '独立测试';

    expect(second).toEqual({ name: '', ownerId: '2' });
    expect(first).toEqual({ name: '独立测试', ownerId: '' });
  });

  it('节点新建沿用节点拥有者', async () => {
    const onSuccess = vi.fn();
    const { form, isGlobalCreate, openCreate, submit } = useAssetFolderFormSubmit({ onSuccess });

    openCreate(ownerNode);
    form.value.name = '新目录';

    expect(isGlobalCreate.value).toBe(false);
    await submit();

    expect(createMock).toHaveBeenCalledWith({ name: '新目录', ownerId: '1' });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('全局新增仅在拥有者 ID 合法时提交', async () => {
    const onSuccess = vi.fn();
    const { form, isGlobalCreate, openGlobalCreate, submit } = useAssetFolderFormSubmit({ onSuccess });

    openGlobalCreate();
    expect(isGlobalCreate.value).toBe(true);

    form.value.name = '代建目录';
    form.value.ownerId = ' abc ';
    await submit();
    expect(createMock).not.toHaveBeenCalled();

    form.value.ownerId = ' 23 ';
    await submit();
    expect(createMock).toHaveBeenCalledWith({ name: '代建目录', ownerId: '23' });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('重命名使用当前节点信息', async () => {
    const folderNode: AssetTreeOption = {
      key: '10',
      label: '旧目录',
      nodeType: 'folder',
      ownerId: '2'
    };
    const { form, openRename, submit } = useAssetFolderFormSubmit({ onSuccess: vi.fn() });

    openRename(folderNode);
    form.value.name = '新目录';
    await submit();

    expect(updateMock).toHaveBeenCalledWith({ id: '10', name: '新目录' });
  });
});
