import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/site-metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    // `/en/…` is an implementation detail that `proxy.ts` redirects away from.
    // Crawlers should never be sent there in the first place.
    disallow: "/en/",
  },
  sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  host: SITE_ORIGIN,
});

export default robots;
