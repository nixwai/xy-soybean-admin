declare namespace ApiManagement {
  interface Menu {
    id: string;
    menuKey: string;
    parentKey: string | null;
    title: string;
    path: string;
    order: number;
    permissionCode: string | null;
    isRootOnly: boolean;
    isActive: boolean;
    permissionAvailable: boolean;
  }
  interface MenuUpdateRequest {
    id: string;
    title?: string;
    order?: number;
    isActive?: boolean;
  }
}
