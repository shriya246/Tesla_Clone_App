import "server-only";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  rateLimitStore?: Map<string, RateLimitBucket>;
};

const rateLimitStore = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitBucket>();

if (!globalForRateLimit.rateLimitStore) {
  globalForRateLimit.rateLimitStore = rateLimitStore;
}

function pruneExpiredBuckets(now: number) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function consumeRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();

  pruneExpiredBuckets(now);

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;

    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: Math.max(config.limit - 1, 0),
      resetAt,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  const remaining = Math.max(config.limit - existing.count, 0);
  const retryAfterSeconds = Math.max(
    Math.ceil((existing.resetAt - now) / 1000),
    1,
  );

  return {
    success: existing.count <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    "Retry-After": String(result.retryAfterSeconds),
  };
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}
