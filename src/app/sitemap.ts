import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://kuadra.app", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://kuadra.app/registro", lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: "https://kuadra.app/login", lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];
}
