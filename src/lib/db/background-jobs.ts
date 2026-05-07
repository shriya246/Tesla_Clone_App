import "server-only";

import {
  BackgroundJobKind,
  BackgroundJobStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface EnqueueBackgroundJobInput {
  kind: BackgroundJobKind;
  payload: Prisma.InputJsonValue;
  dedupeKey?: string;
  maxAttempts?: number;
  runAfter?: Date;
}

export async function createBackgroundJob(input: EnqueueBackgroundJobInput) {
  const data = {
    kind: input.kind,
    payload: input.payload,
    dedupeKey: input.dedupeKey,
    maxAttempts: input.maxAttempts ?? 3,
    runAfter: input.runAfter ?? new Date(),
  };

  if (!input.dedupeKey) {
    return prisma.backgroundJob.create({
      data,
    });
  }

  const existing = await prisma.backgroundJob.findUnique({
    where: {
      dedupeKey: input.dedupeKey,
    },
  });

  if (existing) {
    return existing;
  }

  try {
    return await prisma.backgroundJob.create({
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const duplicate = await prisma.backgroundJob.findUnique({
        where: {
          dedupeKey: input.dedupeKey,
        },
      });

      if (duplicate) {
        return duplicate;
      }
    }

    throw error;
  }
}

export async function getDueBackgroundJobs(input: {
  kinds?: BackgroundJobKind[];
  limit: number;
}) {
  return prisma.backgroundJob.findMany({
    where: {
      status: BackgroundJobStatus.PENDING,
      runAfter: {
        lte: new Date(),
      },
      kind: input.kinds?.length
        ? {
            in: input.kinds,
          }
        : undefined,
    },
    orderBy: [
      {
        runAfter: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    take: input.limit,
  });
}

export async function claimBackgroundJob(input: {
  id: string;
  lockedBy: string;
}) {
  const updated = await prisma.backgroundJob.updateMany({
    where: {
      id: input.id,
      status: BackgroundJobStatus.PENDING,
      runAfter: {
        lte: new Date(),
      },
    },
    data: {
      status: BackgroundJobStatus.PROCESSING,
      lockedAt: new Date(),
      lockedBy: input.lockedBy,
    },
  });

  if (updated.count === 0) {
    return null;
  }

  return prisma.backgroundJob.findUnique({
    where: {
      id: input.id,
    },
  });
}

export function markBackgroundJobSucceeded(id: string) {
  return prisma.backgroundJob.update({
    where: {
      id,
    },
    data: {
      attempts: {
        increment: 1,
      },
      status: BackgroundJobStatus.SUCCEEDED,
      lastError: null,
      lockedAt: null,
      lockedBy: null,
      completedAt: new Date(),
    },
  });
}

export function markBackgroundJobRetryableFailure(input: {
  id: string;
  message: string;
  runAfter: Date;
}) {
  return prisma.backgroundJob.update({
    where: {
      id: input.id,
    },
    data: {
      attempts: {
        increment: 1,
      },
      status: BackgroundJobStatus.PENDING,
      runAfter: input.runAfter,
      lastError: input.message,
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export function markBackgroundJobFailed(input: {
  id: string;
  message: string;
}) {
  return prisma.backgroundJob.update({
    where: {
      id: input.id,
    },
    data: {
      attempts: {
        increment: 1,
      },
      status: BackgroundJobStatus.FAILED,
      lastError: input.message,
      lockedAt: null,
      lockedBy: null,
      completedAt: new Date(),
    },
  });
}

export function recoverStalledBackgroundJobs(stalledBefore: Date) {
  return prisma.backgroundJob.updateMany({
    where: {
      status: BackgroundJobStatus.PROCESSING,
      lockedAt: {
        lt: stalledBefore,
      },
    },
    data: {
      status: BackgroundJobStatus.PENDING,
      lockedAt: null,
      lockedBy: null,
      runAfter: new Date(),
    },
  });
}

export async function getBackgroundJobSummary() {
  const groups = await prisma.backgroundJob.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  return {
    pending: groups.find((group) => group.status === "PENDING")?._count.id ?? 0,
    processing:
      groups.find((group) => group.status === "PROCESSING")?._count.id ?? 0,
    succeeded:
      groups.find((group) => group.status === "SUCCEEDED")?._count.id ?? 0,
    failed: groups.find((group) => group.status === "FAILED")?._count.id ?? 0,
    cancelled:
      groups.find((group) => group.status === "CANCELLED")?._count.id ?? 0,
  };
}

export function getRecentBackgroundJobs(limit = 8) {
  return prisma.backgroundJob.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      kind: true,
      status: true,
      attempts: true,
      maxAttempts: true,
      runAfter: true,
      lastError: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
    },
  });
}
