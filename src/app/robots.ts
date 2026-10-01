import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Private pages (account, basket, orders, favorites, password/email flows) are not blocked here on purpose:
// they carry `noindex` meta tags, and Google can only see those if crawling is allowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
