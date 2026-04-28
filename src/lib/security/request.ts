import { env } from "@/lib/env";

function normalizeHostValue(value: string) {
  return value.trim().toLowerCase();
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      ?.trim()
      .replace(/^::ffff:/, "");
  }

  return request.headers.get("x-real-ip")?.trim().replace(/^::ffff:/, "");
}

export function getRequestHostCandidates(request: Request) {
  const candidates = new Set<string>();
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (host) {
    candidates.add(normalizeHostValue(host));
  }

  if (forwardedHost) {
    forwardedHost
      .split(",")
      .map(normalizeHostValue)
      .forEach((value) => candidates.add(value));
  }

  if (env.NEXT_PUBLIC_APP_URL) {
    candidates.add(normalizeHostValue(new URL(env.NEXT_PUBLIC_APP_URL).host));
  }

  if (process.env.NODE_ENV !== "production") {
    candidates.add("localhost:3000");
    candidates.add("127.0.0.1:3000");
  }

  return candidates;
}

export function isTrustedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originHost = normalizeHostValue(new URL(origin).host);

    return getRequestHostCandidates(request).has(originHost);
  } catch {
    return false;
  }
}
