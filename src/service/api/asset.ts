import { request } from '../request';

/** 查询当前账号的素材文件夹树。 */
export function fetchAssetFolderTree() {
  return request<ApiManagement.AssetFolderTreeResponse>({
    url: '/asset/folder/tree'
  });
}

/** 查询全部账号的素材文件夹树。 */
export function fetchAssetFolderTreeAll() {
  return request<ApiManagement.AssetFolderTreeResponse>({
    url: '/asset/folder/tree/all'
  });
}

/** 创建素材文件夹。 */
export function fetchAssetFolderCreate(data: ApiManagement.AssetFolderCreateRequest) {
  return request<ApiManagement.AssetFolder>({
    url: '/asset/folder/create',
    method: 'post',
    data
  });
}

/** 重命名素材文件夹。 */
export function fetchAssetFolderUpdate(data: ApiManagement.AssetFolderUpdateRequest) {
  return request<ApiManagement.AssetFolder>({
    url: '/asset/folder/update',
    method: 'post',
    data
  });
}

/** 软删除素材文件夹。 */
export function fetchAssetFolderSoftDelete(data: ApiManagement.IdRequest) {
  return request<null>({
    url: '/asset/folder/soft-delete',
    method: 'post',
    data
  });
}

/** 分页查询当前文件夹直属图片。 */
export function fetchAssetImageList(params: ApiManagement.AssetImageListQuery) {
  return request<ApiManagement.AssetImagePageResponse>({
    url: '/asset/image/list',
    params
  });
}

/** 批量上传图片到指定文件夹。 */
export function fetchAssetImageUpload(folderId: string, files: File[]) {
  const data = new FormData();
  data.append('folderId', folderId);
  files.forEach(file => data.append('files', file));
  return request<ApiManagement.AssetImageUploadResponse>({
    url: '/asset/image/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
