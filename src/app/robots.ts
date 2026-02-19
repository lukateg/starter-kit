import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Explicitly declare canonical host for crawlers
  };
}
