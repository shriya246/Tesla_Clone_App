import type { CSSProperties } from "react";

const remoteMediaUrlPattern = /^https?:\/\//i;

function escapeCssUrl(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function normalizeMediaUrl(value?: string | null, fallback = "") {
  const normalized = value?.trim();

  if (normalized) {
    return normalized;
  }

  return fallback;
}

export function isRemoteMediaUrl(value?: string | null) {
  const normalized = value?.trim();

  return Boolean(normalized && remoteMediaUrlPattern.test(normalized));
}

export function isMediaUrl(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return false;
  }

  return normalized.startsWith("/") || remoteMediaUrlPattern.test(normalized);
}

export function buildMediaBackgroundStyle(input: {
  image?: string | null;
  overlay: string;
  backgroundColor?: string;
}): CSSProperties {
  const image = normalizeMediaUrl(input.image);

  return {
    backgroundColor: input.backgroundColor ?? "#06070a",
    backgroundImage: image
      ? `${input.overlay}, url("${escapeCssUrl(image)}")`
      : input.overlay,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
}
