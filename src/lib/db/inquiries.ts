import "server-only";

import { Prisma, type InquiryPriority, type InquiryStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function listInquiries() {
  return prisma.inquiry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function createInquiry(data: Prisma.InquiryUncheckedCreateInput) {
  return prisma.inquiry.create({
    data,
  });
}

export function getInquiryByIdForIntegration(inquiryId: string) {
  return prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
    select: {
      id: true,
      type: true,
      status: true,
      priority: true,
      name: true,
      email: true,
      phone: true,
      message: true,
      productSlug: true,
      itemType: true,
      operationalTags: true,
      lastAutomatedAt: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          name: true,
          email: true,
          intentLevel: true,
          recommendationEligible: true,
        },
      },
    },
  });
}

export function updateInquiryWorkflowState(input: {
  inquiryId: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  operationalTags: string[];
  lastAutomatedAt?: Date;
}) {
  return prisma.inquiry.update({
    where: {
      id: input.inquiryId,
    },
    data: {
      status: input.status,
      priority: input.priority,
      operationalTags: input.operationalTags,
      lastAutomatedAt: input.lastAutomatedAt ?? new Date(),
    },
  });
}

export async function getInquiriesByUser(userId: string, limit = 10) {
  try {
    return await prisma.inquiry.findMany({
      where: {
        userId,
        itemType: {
          not: null,
        },
        productSlug: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function countInquiriesByUser(userId: string) {
  try {
    return await prisma.inquiry.count({
      where: {
        userId,
      },
    });
  } catch {
    return 0;
  }
}
