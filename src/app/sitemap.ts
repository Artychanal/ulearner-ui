import type { MetadataRoute } from "next";
import { fetchCatalogCourses } from "@/lib/catalog-service";
import { adaptCatalogCourse } from "@/lib/catalog-adapter";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl =
  envSiteUrl && envSiteUrl.length > 0 ? envSiteUrl : "https://ulearner-ui.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const courseCollection = await fetchCatalogCourses({ limit: 200 }).catch(() => ({
    items: [],
    meta: { total: 0, limit: 0, offset: 0 },
  }));
  const courseRoutes: MetadataRoute.Sitemap = courseCollection.items.map((course) => {
    const normalized = adaptCatalogCourse(course);
    return {
      url: `${siteUrl}/courses/${normalized.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...courseRoutes];
}
