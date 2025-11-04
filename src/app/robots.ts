import type { MetadataRoute } from "next";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl =
  envSiteUrl && envSiteUrl.length > 0 ? envSiteUrl : "https://ulearner-ui.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
