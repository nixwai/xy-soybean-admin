import { computed, ref } from 'vue';
import { PERMISSION_CODE } from '@/constants/permission';
import { fetchAllAssetFolderTree, fetchAssetFolderTree } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { buildAssetTree, buildPersonalAssetTree, createOwnerAssetNode, findAssetTreeNode } from '../utils/asset-tree';

/** 管理素材文件夹树的数据源、查看范围与节点选中。 */
export function useAssetFolderTree() {
  const { hasAuth } = useAuth();
  const authStore = useAuthStore();
  /** 是否具备查看全部账号素材的权限。 */
  const canViewAll = computed(() => hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL));
  const loading = ref(false);
  const scopeAll = ref(false);
  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const owners = ref<ApiManagement.AssetFolderOwnerTree[]>([]);
  /** 全部视图保留账号根节点，个人视图仅展示当前账号的顶层文件夹。 */
  const treeData = computed(() =>
    scopeAll.value ? buildAssetTree(owners.value) : buildPersonalAssetTree(owners.value)
  );
  const selectedNode = computed(() => findAssetTreeNode(treeData.value, selectedKeys.value[0]));
  /** 个人视图顶层新建目标：优先取个人树根账号，取数完成前以当前登录账号兜底，展示名按后端约定回退为 ID。 */
  const personalOwnerNode = computed(() =>
    createOwnerAssetNode(
      owners.value[0]?.owner ?? { id: authStore.userInfo.userId, username: authStore.userInfo.userId }
    )
  );
  /** 顶层新建入口仅要求新建权限；全部视图的进入已由 canViewAll 在范围切换处收口。 */
  const canCreateTopLevel = computed(() => hasAuth(PERMISSION_CODE.ASSET_FOLDER_CREATE));

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
    canCreateTopLevel,
    canViewAll,
    changeScope,
    expandedKeys,
    loadTree,
    loading,
    personalOwnerNode,
    scopeAll,
    selectedKeys,
    selectedNode,
    treeData
  };
}
