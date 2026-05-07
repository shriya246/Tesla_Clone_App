import { prisma } from "@/lib/prisma";
import type { UserIntentLevel } from "@prisma/client";

export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export function getUserContinuityPreferencesById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      buildReminderOptIn: true,
      productUpdatesOptIn: true,
    },
  });
}

export function getUserWorkflowProfileById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      intentLevel: true,
      recommendationEligible: true,
      intentQualifiedAt: true,
    },
  });
}

export function updateUserWorkflowProfile(input: {
  id: string;
  intentLevel: UserIntentLevel;
  recommendationEligible: boolean;
  intentQualifiedAt?: Date | null;
}) {
  return prisma.user.update({
    where: {
      id: input.id,
    },
    data: {
      intentLevel: input.intentLevel,
      recommendationEligible: input.recommendationEligible,
      intentQualifiedAt:
        typeof input.intentQualifiedAt === "undefined"
          ? undefined
          : input.intentQualifiedAt,
    },
    select: {
      intentLevel: true,
      recommendationEligible: true,
      intentQualifiedAt: true,
    },
  });
}

export function updateUserContinuityPreferences(input: {
  id: string;
  buildReminderOptIn: boolean;
  productUpdatesOptIn: boolean;
}) {
  return prisma.user.update({
    where: {
      id: input.id,
    },
    data: {
      buildReminderOptIn: input.buildReminderOptIn,
      productUpdatesOptIn: input.productUpdatesOptIn,
    },
    select: {
      buildReminderOptIn: true,
      productUpdatesOptIn: true,
    },
  });
}
