import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env, hasDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!env.DATABASE_URL) {
    return null;
  }

  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return (
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  );
}

const prismaClient = createPrismaClient();

if (process.env.NODE_ENV !== "production" && prismaClient) {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (!prismaClient) {
      throw new Error(
        "Database client is not configured. Add DATABASE_URL to enable database-backed features.",
      );
    }

    const value = Reflect.get(prismaClient, property);

    return typeof value === "function" ? value.bind(prismaClient) : value;
  },
});

export function getPrismaClient() {
  return prismaClient;
}

export const isDatabaseConfigured = hasDatabaseUrl;
