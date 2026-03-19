import type { MetadataRoute } from "next";
import { mockImages } from "@/data/mock";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://freepics.cc";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/zh/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic image pages (both locales)
  const imagePages: MetadataRoute.Sitemap = mockImages.flatMap((image) => [
    {
      url: `${baseUrl}/zh/image/${image.id}`,
      lastModified: new Date(image.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/image/${image.id}`,
      lastModified: new Date(image.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);

  return [...staticPages, ...imagePages];
}
