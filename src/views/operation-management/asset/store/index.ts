import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AssetTreeOption } from '../typings';

/**
 * 素材管理页共享上下文。
 *
 * 查看范围与选中节点同时被文件夹面板和图片面板消费，集中在此避免页面层层透传。
 */
export const useAssetContextStore = defineStore('asset-context-store', () => {
  /** 是否处于全部账号查看范围，无全局权限时保持为假。 */
  const scopeAll = ref(false);
  /** 文件夹树当前选中的节点。 */
  const selectedNode = ref<AssetTreeOption | null>(null);

  /** 切换查看范围，范围变化后原选中节点不再属于当前数据源。 */
  function setScopeAll(value: boolean) {
    if (scopeAll.value === value) return;
    scopeAll.value = value;
    selectedNode.value = null;
  }

  /** 记录文件夹面板选中的节点。 */
  function setSelectedNode(node: AssetTreeOption | null) {
    selectedNode.value = node;
  }

  /** 离开页面时恢复默认上下文。 */
  function reset() {
    scopeAll.value = false;
    selectedNode.value = null;
  }

  return { scopeAll, selectedNode, setScopeAll, setSelectedNode, reset };
});
