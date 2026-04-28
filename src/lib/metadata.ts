import type { Metadata } from "next";

import { env } from "@/lib/env";
import { isRemoteMediaUrl } from "@/lib/media";

export const SITE_NAME = "Tesla Inspired";
export const SITE_TITLE = "Tesla Inspired | Electric Vehicles, Energy, and Accessories";
export const SITE_DESCRIPTION =
  "A Tesla-inspired product platform for vehicles, home energy, accessories, favorites, admin workflows, and guided inquiry flows.";
export const DEFAULT_SITE_URL = "http://localhost:3000";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/opengraph-image";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configured =
    env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return trimTrailingSlash(configured);
  }

  return `https://${trimTrailingSlash(configured)}`;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function createAbsoluteUrl(path = "/") {
  return new URL(path, getMetadataBase()).toString();
}

export function getSocialImageUrl(image?: string | null) {
  const normalized = image?.trim();

  if (normalized && isRemoteMediaUrl(normalized)) {
    return normalized;
  }

  return createAbsoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH);
}

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  type = "website",
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const socialImage = getSocialImageUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      url: path,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
