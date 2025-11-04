import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl =
  envSiteUrl && envSiteUrl.length > 0 ? envSiteUrl : "https://ulearner-ui.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/courses",
    "/login",
    "/signup",
    "/dashboard",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/courses/${course.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes];
}
