import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAssetContextStore } from '@/views/operation-management/asset/store';
import type { AssetTreeOption } from '@/views/operation-management/asset/typings';

describe('素材页共享上下文', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('默认处于个人范围且没有选中节点', () => {
    const store = useAssetContextStore();

    expect(store.scopeAll).toBe(false);
    expect(store.selectedNode).toBeNull();
  });

  it('切换范围和选中节点后可以被重置', () => {
    const store = useAssetContextStore();
    const node: AssetTreeOption = { key: 'folder-1', label: '素材目录', nodeType: 'folder', ownerId: '1' };

    store.setScopeAll(true);
    store.setSelectedNode(node);
    expect(store.scopeAll).toBe(true);
    expect(store.selectedNode).toEqual(node);

    store.reset();
    expect(store.scopeAll).toBe(false);
    expect(store.selectedNode).toBeNull();
  });

  it('离开个人范围时同步清空选中节点', () => {
    const store = useAssetContextStore();
    store.setSelectedNode({ key: 'folder-1', label: '素材目录', nodeType: 'folder', ownerId: '1' });

    store.setScopeAll(true);

    expect(store.selectedNode).toBeNull();
  });
});
