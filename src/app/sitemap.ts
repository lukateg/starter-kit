import { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Revalidate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Fetch published blog articles from Convex (dynamic content from blogArticles table)
  let publishedBlogArticles: MetadataRoute.Sitemap = [];

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Fetch all published blog articles
    const articles = await convex.query(api.blogArticles.getPublishedArticles);

    publishedBlogArticles = articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      // NOTE: updatedAt reflects the last time the article was modified/republished
      // This is used as the lastModified date for SEO (Google's sitemap <lastmod> tag)
      lastModified: new Date(article.updatedAt || article.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching published blog articles for sitemap:", error);
    // Continue without published articles if there's an error
  }

  return [...staticPages, ...publishedBlogArticles];
}
