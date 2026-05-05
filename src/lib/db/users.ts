import { prisma } from "@/lib/prisma";

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
