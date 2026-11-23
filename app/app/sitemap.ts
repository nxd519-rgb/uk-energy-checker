
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://uk-energy-checker.vercel.app";

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
