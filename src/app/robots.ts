import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/superadmin/", "/admin/", "/ajustes/"],
    },
    sitemap: "https://kuadra.app/sitemap.xml",
  };
}
