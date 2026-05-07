import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AutomationEventLogListItem } from "@/types";

export function createAutomationEventLog(data: Prisma.AutomationEventLogUncheckedCreateInput) {
  return prisma.automationEventLog.create({
    data,
  });
}

export async function getRecentAutomationEventLogs(
  limit = 4,
): Promise<AutomationEventLogListItem[]> {
  try {
    const logs = await prisma.automationEventLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        eventType: true,
        entityType: true,
        entityId: true,
        handler: true,
        status: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      eventType: log.eventType,
      entityType: log.entityType,
      entityId: log.entityId,
      handler: log.handler,
      status: log.status,
      message: log.message,
      createdAt: log.createdAt,
      userEmail: log.user?.email,
    }));
  } catch {
    return [];
  }
}
