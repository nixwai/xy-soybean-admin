declare namespace ApiManagement {
  type Booleanish = boolean | 0 | 1;
  interface PageQuery {
    page: number;
    pageSize: number;
  }
  interface PageResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
  interface ListResponse<T> {
    items: T[];
    total: number;
  }
  interface IdRequest {
    id: string;
  }
  interface SensitiveIdRequest extends IdRequest {
    currentPassword?: string;
  }
}
