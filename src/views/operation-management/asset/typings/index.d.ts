export interface AssetAccess {
  showAll: boolean;
  readAll: (resource: 'folder' | 'image') => boolean;
  read: (resource: 'folder' | 'image', ownerId: string) => boolean;
  write: (resource: 'folder' | 'image', action: string, ownerId: string) => boolean;
  target: (ownerId: string, folderId: string | null) => boolean;
}
export interface AssetSelection {
  ownerId: string | null;
  folderId: string | null;
  unclassified: boolean;
}
export interface AssetUploadEntry {
  id: number;
  file: File;
  ownerId: string;
  folderId: string | null;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  reason: string;
}
