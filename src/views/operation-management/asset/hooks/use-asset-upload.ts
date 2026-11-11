import { computed, ref } from 'vue';
import { uploadAssets } from '@/service/api/asset';
import { isAssetUploadLimits } from '../utils/upload-limits';
import type { AssetUploadEntry } from '../typings';

/** 每个条目保存不可变目标快照，重试只发送失败项，同名文件分批避免结果错配。 */
export function useAssetUpload(
  allowed: (ownerId: string, folderId: string | null) => boolean,
  changed: () => void | Promise<void>,
  getLimits: () => ApiManagement.AssetUploadLimits | null
) {
  const entries = ref<AssetUploadEntry[]>([]);
  const busy = ref(false);
  const hasFailed = computed(() => entries.value.some(item => item.status === 'failed'));
  let sequence = 0;
  const update = (id: number, status: AssetUploadEntry['status'], reason = '') => {
    entries.value = entries.value.map(item => (item.id === id ? { ...item, status, reason } : item));
  };

  async function send(batch: AssetUploadEntry[]) {
    batch.forEach(item => update(item.id, 'uploading'));
    try {
      const { data, error } = await uploadAssets(
        batch.map(item => item.file),
        batch[0].folderId,
        batch[0].ownerId
      );
      batch.forEach(item => {
        const failed = data?.failed.find(failure => failure.filename === item.file.name);
        const success = !error && data?.success.some(asset => asset.originalName === item.file.name);
        update(
          item.id,
          success && !failed ? 'success' : 'failed',
          failed?.reason || (success ? '' : error?.message || '上传结果无效，请重试')
        );
      });
    } catch (error) {
      batch.forEach(item => update(item.id, 'failed', error instanceof Error ? error.message : '上传失败，请重试'));
    }
  }

  async function run(items: AssetUploadEntry[]) {
    if (busy.value || !items.length || !isAssetUploadLimits(getLimits())) return;
    busy.value = true;
    try {
      let pending = [...items];
      while (pending.length) {
        const limits = getLimits();
        if (!isAssetUploadLimits(limits)) {
          pending.forEach(item => update(item.id, 'failed', '上传配置未就绪，请重新加载配置后重试'));
          break;
        }
        const first = pending[0];
        if (!first.file.size || first.file.size > limits.maxFileSize || first.file.size > limits.maxBatchSize) {
          update(
            first.id,
            'failed',
            first.file.size
              ? `单个图片不能超过 ${Math.min(limits.maxFileSize, limits.maxBatchSize) / 1024 / 1024}MiB（服务端限制）`
              : '图片文件不能为空'
          );
          pending = pending.slice(1);
          continue;
        }
        if (!allowed(first.ownerId, first.folderId)) {
          update(first.id, 'failed', '归属用户已停用或无目标操作权限');
          pending = pending.slice(1);
          continue;
        }
        const names = new Set<string>();
        let bytes = 0;
        let count = 0;
        const batch = pending.filter(item => {
          if (
            item.ownerId !== first.ownerId ||
            item.folderId !== first.folderId ||
            names.has(item.file.name) ||
            !item.file.size ||
            item.file.size > limits.maxFileSize ||
            count >= Math.min(3, limits.maxFiles) ||
            bytes + item.file.size > limits.maxBatchSize
          )
            return false;
          bytes += item.file.size;
          count += 1;
          names.add(item.file.name);
          return true;
        });
        await send(batch);
        pending = pending.filter(item => !batch.some(sent => sent.id === item.id));
      }
      if (items.some(item => entries.value.some(current => current.id === item.id && current.status === 'success')))
        await changed();
    } finally {
      busy.value = false;
    }
  }

  async function add(files: File[], context: { ownerId: string; folderId: string | null }) {
    if (busy.value || !isAssetUploadLimits(getLimits()) || !allowed(context.ownerId, context.folderId)) return;
    const items: AssetUploadEntry[] = files.map(file => ({
      id: ++sequence,
      file,
      ...context,
      status: 'pending',
      reason: ''
    }));
    entries.value = [...entries.value, ...items];
    await run(items);
  }
  const retry = () => run(entries.value.filter(item => item.status === 'failed'));
  return { entries, busy, hasFailed, add, retry };
}
