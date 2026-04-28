import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function requireAdminApiSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "You must be signed in to manage product media.",
        },
        { status: 401 },
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Admin access is required for this action.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    session: {
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email ?? undefined,
      },
    },
  };
}
