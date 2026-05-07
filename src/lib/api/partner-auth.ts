import "server-only";

import { NextResponse } from "next/server";

import { getPartnerApiKeyList, hasPartnerApiKeys } from "@/lib/env";

function extractApiKey(request: Request) {
  const directHeader = request.headers.get("x-api-key")?.trim();

  if (directHeader) {
    return directHeader;
  }

  const authorization = request.headers.get("authorization")?.trim();

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/, 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token.trim();
}

export function requirePartnerApiKey(request: Request) {
  if (!hasPartnerApiKeys) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message:
            "Partner API access is not configured for this environment.",
        },
        { status: 503 },
      ),
    };
  }

  const providedApiKey = extractApiKey(request);

  if (!providedApiKey) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "A partner API key is required for this endpoint.",
        },
        { status: 401 },
      ),
    };
  }

  if (!getPartnerApiKeyList().includes(providedApiKey)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "That partner API key is not valid.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    apiKey: providedApiKey,
  };
}
