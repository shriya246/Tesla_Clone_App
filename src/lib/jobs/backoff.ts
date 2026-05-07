const BASE_RETRY_DELAY_MS = 60 * 1000;
const MAX_RETRY_DELAY_MS = 60 * 60 * 1000;

export function calculateRetryDelayMs(failedAttemptCount: number) {
  const exponent = Math.max(0, failedAttemptCount - 1);
  const delay = BASE_RETRY_DELAY_MS * 2 ** exponent;

  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

export function getNextRetryAt(failedAttemptCount: number, now = new Date()) {
  return new Date(now.getTime() + calculateRetryDelayMs(failedAttemptCount));
}
