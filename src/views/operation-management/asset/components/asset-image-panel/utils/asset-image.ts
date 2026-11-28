/** 将字节数转换为适合后台展示的文件大小。 */
export function formatAssetImageSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

/** 将后端时间转换为本地日期时间。 */
export function formatAssetImageDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/** 将图片 MIME 类型转换为列表展示名称。 */
export function formatAssetImageType(item: Pick<ApiManagement.AssetImage, 'mimeType'>): string {
  return item.mimeType.replace('image/', '').toUpperCase().replace('JPEG', 'JPG');
}

/** 只保留后端支持的图片文件。 */
export function filterAssetImageFiles(files: readonly File[]): File[] {
  return files.filter(file => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type));
}
