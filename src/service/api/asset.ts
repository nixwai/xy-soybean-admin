import { request } from '../request';

export function fetchAssetUploadLimits() {
  return request<ApiManagement.AssetUploadLimits>({ url: '/asset/upload-limits' });
}

export function fetchAssetOwners() {
  return request<ApiManagement.ListResponse<ApiManagement.AssetOwner>>({ url: '/asset/owners' });
}

export function fetchAssetFolders(ownerId?: string) {
  return request<ApiManagement.ListResponse<ApiManagement.AssetFolder>>({
    url: '/asset/folders',
    params: ownerId ? { ownerId } : undefined
  });
}
export function fetchAllAssetFolders(ownerId?: string) {
  return request<ApiManagement.ListResponse<ApiManagement.AssetFolder>>({
    url: '/asset/folders/all',
    params: ownerId ? { ownerId } : undefined
  });
}
export function createAssetFolder(data: ApiManagement.AssetFolderCreateRequest) {
  return request<ApiManagement.AssetFolder>({
    url: '/asset/folders',
    method: 'post',
    data
  });
}
export function updateAssetFolder(data: ApiManagement.AssetFolderUpdateRequest) {
  return request<ApiManagement.AssetFolder>({
    url: `/asset/folders/${data.id}`,
    method: 'patch',
    data: { name: data.name, ownerId: data.ownerId }
  });
}
export function deleteAssetFolder(id: string, ownerId?: string) {
  return request<null>({ url: `/asset/folders/${id}`, method: 'delete', params: ownerId ? { ownerId } : undefined });
}
export function fetchAssets(params: ApiManagement.AssetQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Asset>>({
    url: '/asset/images',
    params
  });
}
export function fetchAllAssets(params: ApiManagement.AssetQuery) {
  return request<ApiManagement.PageResponse<ApiManagement.Asset>>({ url: '/asset/images/all', params });
}
export async function uploadAssets(files: File[], folderId: string | null, ownerId?: string) {
  const data = new FormData();
  files.forEach(file => data.append('files', file));
  if (folderId) data.append('folderId', folderId);
  if (ownerId) data.append('ownerId', ownerId);
  const result = await request<ApiManagement.BatchAssetUploadResponse>({
    url: '/asset/images/batch',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  // 全部失败由服务端以业务错误返回，保留 error，仅恢复可展示的逐文件明细。
  const detail: unknown = result.error?.response?.data?.data;
  if (result.error && isFailedUpload(detail)) return { ...result, data: detail };
  return result;
}

function isFailedUpload(value: unknown): value is ApiManagement.BatchAssetUploadResponse {
  if (!value || typeof value !== 'object') return false;
  const result = value as ApiManagement.BatchAssetUploadResponse;
  return (
    Array.isArray(result.success) &&
    result.success.length === 0 &&
    Array.isArray(result.failed) &&
    result.failed.length > 0 &&
    result.failed.every(item => typeof item?.filename === 'string' && typeof item.reason === 'string') &&
    result.successCount === 0 &&
    result.totalCount === result.failed.length
  );
}
export function moveAsset(id: string, folderId: string | null, ownerId?: string) {
  return request<ApiManagement.Asset>({
    url: `/asset/images/${id}/folder`,
    method: 'patch',
    data: { folderId, ownerId }
  });
}
export function deleteAsset(id: string, ownerId?: string) {
  return request<null>({ url: `/asset/images/${id}`, method: 'delete', params: ownerId ? { ownerId } : undefined });
}
