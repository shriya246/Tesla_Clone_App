import "server-only";

import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/auth";

type AdminSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    role: "ADMIN";
  };
};

export async function requireAdminSession(
  callbackUrl = "/admin",
): Promise<AdminSession> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/account?notice=admin");
  }

  return session as AdminSession;
}
