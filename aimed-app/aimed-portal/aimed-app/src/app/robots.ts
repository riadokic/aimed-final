import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/novi-nalaz", "/historija", "/pacijenti", "/postavke", "/api/"],
    },
    sitemap: "https://aimed.ba/sitemap.xml",
  };
}
