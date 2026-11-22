import { request } from '../request';

/** 查询当前账号的素材文件夹树。 */
export function fetchAssetFolderTree() {
  return request<ApiManagement.AssetFolderTreeResponse>({ url: '/asset/folder/tree' });
}

/** 查询全部账号的素材文件夹树。 */
export function fetchAssetFolderTreeAll() {
  return request<ApiManagement.AssetFolderTreeResponse>({ url: '/asset/folder/tree/all' });
}

/** 创建素材文件夹。 */
export function fetchAssetFolderCreate(data: ApiManagement.AssetFolderCreateRequest) {
  return request<ApiManagement.AssetFolder>({ url: '/asset/folder/create', method: 'post', data });
}

/** 重命名素材文件夹。 */
export function fetchAssetFolderUpdate(data: ApiManagement.AssetFolderUpdateRequest) {
  return request<ApiManagement.AssetFolder>({ url: '/asset/folder/update', method: 'post', data });
}

/** 软删除素材文件夹。 */
export function fetchAssetFolderSoftDelete(data: ApiManagement.IdRequest) {
  return request<null>({ url: '/asset/folder/soft-delete', method: 'post', data });
}
