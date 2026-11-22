import { ref } from 'vue';
import { fetchMenuDisable, fetchMenuEnable } from '@/service/api';

interface MenuStatusOptions {
  onSuccess: () => void | Promise<void>;
}

/** 切换菜单启用状态，停用后该菜单不再出现在任何管理员的可见菜单中。 */
export function useMenuStatus(options: MenuStatusOptions) {
  /** 正在提交启停请求的菜单 ID，用于行内加载态。 */
  const pendingId = ref('');

  async function toggle(row: ApiManagement.Menu) {
    if (pendingId.value) return;

    pendingId.value = row.id;
    try {
      const { error } = row.isActive ? await fetchMenuDisable({ id: row.id }) : await fetchMenuEnable({ id: row.id });
      if (error) return;

      window.$message?.success(row.isActive ? '菜单已停用' : '菜单已启用');
      await options.onSuccess();
    } finally {
      pendingId.value = '';
    }
  }

  return { pendingId, toggle };
}
