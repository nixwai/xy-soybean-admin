/** 接口配置必须完整有效，不用客户端默认值掩盖配置加载失败。 */
export function isAssetUploadLimits(value: unknown): value is ApiManagement.AssetUploadLimits {
  if (!value || typeof value !== 'object') return false;
  const limits = value as ApiManagement.AssetUploadLimits;
  return [limits.maxFiles, limits.maxFileSize, limits.maxBatchSize].every(
    limit => Number.isSafeInteger(limit) && limit > 0
  );
}
