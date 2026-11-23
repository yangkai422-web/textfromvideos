import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date("2026-11-23"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/instagram-reels-transcript/`,
      lastModified: new Date("2026-11-22"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: new Date("2026-11-20"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified: new Date("2026-11-16"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: new Date("2026-11-23"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
