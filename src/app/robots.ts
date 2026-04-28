import type { MetadataRoute } from "next";

import { createAbsoluteUrl, getSiteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/admin", "/api", "/signin"],
      },
    ],
    sitemap: createAbsoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
