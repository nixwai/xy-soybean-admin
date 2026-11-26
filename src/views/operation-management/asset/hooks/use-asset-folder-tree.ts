import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { PERMISSION_CODE } from '@/constants/permission';
import { fetchAssetFolderTreeAll, fetchAssetFolderTree } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import {
  buildAssetTree,
  buildPersonalAssetTree,
  createOwnerAssetNode,
  filterAssetTree,
  findAssetTreeNode
} from '../utils/asset-tree';
import { useAssetContextStore } from '../store';
import type { AssetTreeQueryModel } from '../typings';

/** 管理素材文件夹树的数据源、节点选中，并把查看范围与选中结果同步到页面共享上下文。 */
export function useAssetFolderTree() {
  const { hasAuth } = useAuth();
  const authStore = useAuthStore();
  const assetContext = useAssetContextStore();
  /** 是否具备查看全部账号素材的权限。 */
  const canViewAll = computed(() => hasAuth(PERMISSION_CODE.ASSET_FOLDER_ALL));
  const loading = ref(false);
  const { scopeAll } = storeToRefs(assetContext);
  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const owners = ref<ApiManagement.AssetFolderOwnerTree[]>([]);
  const query = reactive<AssetTreeQueryModel>({ keyword: '' });
  /** 全部视图保留账号根节点，个人视图仅展示当前账号的顶层文件夹。 */
  const completeTreeData = computed(() =>
    scopeAll.value ? buildAssetTree(owners.value) : buildPersonalAssetTree(owners.value)
  );
  const treeData = computed(() => filterAssetTree(completeTreeData.value, query));
  /** 顶层新建目标：优先取个人树根账号，取数完成前以当前登录账号兜底，展示名按后端约定回退为 ID。 */
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
      const { data, error } = scopeAll.value ? await fetchAssetFolderTreeAll() : await fetchAssetFolderTree();
      if (error || !data) return;

      owners.value = data.owners;
      // 全部视图以账号为根，默认展开一层，避免文件夹必须再次点击才能看到。
      expandedKeys.value = scopeAll.value ? owners.value.map(group => createOwnerAssetNode(group.owner).key) : [];
      if (selectedKeys.value.length && !findAssetTreeNode(completeTreeData.value, selectedKeys.value[0])) {
        selectedKeys.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  /** 切换查看范围，同时清空选中并重新取数。 */
  async function changeScope(value: boolean) {
    if (!canViewAll.value || scopeAll.value === value) return;
    assetContext.setScopeAll(value);
    selectedKeys.value = [];
    await loadTree();
  }

  // 选中键由树控件维护，解析出的节点同步给共享上下文，供右侧图片区域消费。
  watch(selectedKeys, keys => {
    assetContext.setSelectedNode(findAssetTreeNode(completeTreeData.value, keys[0]));
  });

  return {
    canCreateTopLevel,
    query,
    canViewAll,
    changeScope,
    expandedKeys,
    loadTree,
    loading,
    personalOwnerNode,
    scopeAll,
    selectedKeys,
    treeData
  };
}
