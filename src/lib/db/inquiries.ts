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
