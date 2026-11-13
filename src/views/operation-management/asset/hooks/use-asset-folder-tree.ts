import { computed, ref } from 'vue';
import { PERMISSION_CODE } from '@/constants/permission';
import { fetchAllAssetFolderTree, fetchAssetFolderTree } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { buildAssetTree, findAssetTreeNode } from '../utils/asset-tree';

/** 管理素材文件夹树的数据源、查看范围与节点选中。 */
export function useAssetFolderTree() {
  const { hasAuth } = useAuth();
  /** 是否具备查看全部账号素材的权限。 */
  const canViewAll = computed(() => hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL));
  const loading = ref(false);
  const scopeAll = ref(false);
  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const owners = ref<ApiManagement.AssetFolderOwnerTree[]>([]);
  const treeData = computed(() => buildAssetTree(owners.value));
  const selectedNode = computed(() => findAssetTreeNode(treeData.value, selectedKeys.value[0]));

  /** 按当前查看范围读取文件夹树，并清理已失效的展开与选中状态。 */
  async function loadTree() {
    loading.value = true;
    try {
      const { data, error } = scopeAll.value ? await fetchAllAssetFolderTree() : await fetchAssetFolderTree();
      if (error || !data) return;

      owners.value = data.owners;
      expandedKeys.value = [];
      if (selectedKeys.value.length && !findAssetTreeNode(treeData.value, selectedKeys.value[0])) {
        selectedKeys.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  /** 切换查看范围，同时清空选中并重新取数。 */
  async function changeScope(value: boolean) {
    if (!canViewAll.value || scopeAll.value === value) return;
    scopeAll.value = value;
    selectedKeys.value = [];
    await loadTree();
  }

  return {
    canViewAll,
    changeScope,
    expandedKeys,
    loadTree,
    loading,
    scopeAll,
    selectedKeys,
    selectedNode,
    treeData
  };
}
