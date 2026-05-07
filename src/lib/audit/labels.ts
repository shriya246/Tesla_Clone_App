import type { AuditAction } from "@prisma/client";

export const auditActionLabels: Record<AuditAction, string> = {
  PRODUCT_CREATED: "Product created",
  PRODUCT_UPDATED: "Product updated",
  PRODUCT_DELETED: "Product deleted",
  RANKING_CONFIG_UPDATED: "Ranking config updated",
  PRODUCT_RANKING_OVERRIDE_UPDATED: "Ranking override updated",
  PRODUCT_RANKING_OVERRIDE_REMOVED: "Ranking override removed",
  EXPORT_REQUESTED: "Export requested",
  IMPORT_VALIDATED: "Import validated",
  IMPORT_APPLIED: "Import applied",
  WEBHOOK_REGISTRY_VIEWED: "Webhook registry viewed",
  BACKGROUND_JOBS_PROCESSED: "Background jobs processed",
};
