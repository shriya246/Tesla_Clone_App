import "server-only";

import type { AuditAction, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
  return prisma.auditLog.create({
    data,
  });
}

export async function getRecentAuditLogs(limit = 10) {
  return prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      message: true,
      actorEmail: true,
      actorRole: true,
      createdAt: true,
      actor: {
        select: {
          email: true,
        },
      },
    },
  });
}

export async function getAuditLogSummary() {
  const [totalCount, recentActions] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    totalCount,
    topActions: recentActions.map((action) => ({
      action: action.action as AuditAction,
      count: action._count.id,
    })),
  };
}
