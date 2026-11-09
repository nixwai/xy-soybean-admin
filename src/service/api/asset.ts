import { request } from '../request';

export function fetchAssetFolders() {
  return request<ApiManagement.ListResponse<ApiManagement.AssetFolder>>({
    url: '/asset/folders'
  });
}
export function fetchAllAssetFolders() {
  return request<ApiManagement.ListResponse<ApiManagement.AssetFolder>>({ url: '/asset/folders/all' });
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
    data: { name: data.name }
  });
}
export function deleteAssetFolder(id: string) {
  return request<null>({ url: `/asset/folders/${id}`, method: 'delete' });
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
export function uploadAssets(files: File[], folderId: string | null) {
  const data = new FormData();
  files.forEach(file => data.append('files', file));
  if (folderId) data.append('folderId', folderId);
  return request<ApiManagement.BatchAssetUploadResponse>({
    url: '/asset/images/batch',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
export function moveAsset(id: string, folderId: string | null) {
  return request<ApiManagement.Asset>({
    url: `/asset/images/${id}/folder`,
    method: 'patch',
    data: { folderId }
  });
}
export function deleteAsset(id: string) {
  return request<null>({ url: `/asset/images/${id}`, method: 'delete' });
}
