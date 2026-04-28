import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

import { env, hasGoogleAuthEnv } from "@/lib/env";
import { getPrismaClient } from "@/lib/prisma";

function getAdminEmailSet() {
  return new Set(
    (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmailSet().has(email.toLowerCase());
}

const prisma = getPrismaClient();
const authSecret =
  env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "tesla-inspired-local-dev-secret"
    : undefined);
const googleProviders = hasGoogleAuthEnv
  ? [
      Google({
        clientId: env.AUTH_GOOGLE_ID!,
        clientSecret: env.AUTH_GOOGLE_SECRET!,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  providers: googleProviders,
  secret: authSecret,
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: prisma ? "database" : "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (prisma && user.email && isAdminEmail(user.email)) {
        await prisma.user.updateMany({
          where: {
            email: user.email,
          },
          data: {
            role: UserRole.ADMIN,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      } else if (user?.email && isAdminEmail(user.email)) {
        token.role = UserRole.ADMIN;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "guest";

        const tokenRole =
          typeof token.role === "string" ? (token.role as UserRole) : undefined;

        session.user.role =
          (user?.email && isAdminEmail(user.email) ? UserRole.ADMIN : user?.role) ??
          tokenRole;
      }

      return session;
    },
  },
});
