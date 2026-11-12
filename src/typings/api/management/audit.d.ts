declare namespace ApiManagement {
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
  }
  interface AuditListResponse {
    items: AuditLog[];
    nextCursor: string | null;
    hasMore: boolean;
  }
}
