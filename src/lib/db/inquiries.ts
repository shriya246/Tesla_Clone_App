import "server-only";

import { Prisma } from "@prisma/client";

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
