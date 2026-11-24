declare namespace ApiManagement {
  interface AuditOption {
    label: string;
    value: string;
    disabled?: boolean;
    [key: string]: unknown;
  }

  interface AuditOptionsResponse {
    actions: AuditOption[];
    resources: AuditOption[];
    results: AuditOption[];
  }

  interface AuditLog {
    id: string;
    actorAdminId: string | null;
    action: string;
    actionLabel: string;
    resourceType: string;
    resourceTypeLabel: string;
    targetId: string | null;
    details: Record<string, unknown> | null;
    succeeded: boolean;
    createdAt: string;
    updatedAt: string;
  }
  interface AuditQuery {
    cursor?: string;
    limit: number;
    actorAdminId?: string;
    targetId?: string;
    action?: string | null;
    resourceType?: string | null;
    succeeded?: boolean;
    createdFrom?: string;
    createdTo?: string;
  }
  interface AuditListResponse {
    items: AuditLog[];
    nextCursor: string | null;
    hasMore: boolean;
  }
}
