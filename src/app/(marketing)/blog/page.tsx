import { Metadata } from "next";
import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { BlogGridWithFilters } from "@/components/blog-grid-with-filters";
import Link from "next/link";
import Image from "next/image";
import { FinalCTASection } from "../components/final-cta-section";

// BlogPost interface
export interface BlogPost {
  id: string;
  title: string;
  shortTitle: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
    title: string;
  };
  tags: string[];
  category: string;
  content: string;
}

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Your App";

export const metadata: Metadata = {
  title: "Blog - Latest Articles",
  description:
    "Read our latest articles, guides, and insights. Stay up to date with tips, tutorials, and best practices.",
  openGraph: {
    title: `Blog - Latest Articles | ${appName}`,
    description:
      "Read our latest articles, guides, and insights.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${appName} Blog`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Latest Articles",
    description:
      "Read our latest articles, guides, and insights.",
    images: ["/og-image.png"],
  },
};

// Type for Convex blog article
interface ConvexBlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  publishDate: number;
  content: string;
  tags: string[];
  category: string;
}

// Helper function to convert Convex article to BlogPost format
function convertToBlogPost(article: ConvexBlogArticle): BlogPost {
  return {
    id: article.slug,
    title: article.title,
    shortTitle: article.title,
    excerpt: article.excerpt,
    image: article.featuredImage || "/placeholder.png",
    date: new Date(article.publishDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: `${Math.ceil(article.content.split(" ").length / 200)} min read`,
    author: {
      name: "Team",
      avatar: "/placeholder.png",
      title: "Author",
    },
    tags: article.tags,
    category: article.category || "Content",
    content: article.content,
  };
}

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  // Fetch articles from Convex
  let allPosts: BlogPost[] = [];
  try {
    const convexArticles = await fetchQuery(
      api.blogArticles.getPublishedArticles
    );
    allPosts = convexArticles.map(convertToBlogPost);
  } catch (error) {
    console.error("Failed to fetch articles from Convex:", error);
  }

  // Get the featured article (first one)
  const featuredArticle = allPosts[0];

  return (
    <main className="min-h-screen bg-white max-w-7xl mx-auto">
      {/* Featured Article Section */}
      {featuredArticle && (
        <div className="">
          <div className="container mx-auto px-4 py-10 max-w-[1400px]">
            <article className="">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Image */}
                <Link
                  href={`/blog/${featuredArticle.id}`}
                  className="relative aspect-[16/9] overflow-hidden rounded-lg   md:my-12 "
                >
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                </Link>
                {/* Right: Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Link href="/blog" className="hover:text-gray-900">
                      Blog
                    </Link>
                    <span>›</span>
                    <span>{featuredArticle.category}</span>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${featuredArticle.id}`}>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                      {featuredArticle.title}
                    </h1>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-lg text-gray-600 mb-6 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <span>{featuredArticle.date}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {featuredArticle.category}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {featuredArticle.author.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {featuredArticle.author.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-16 max-w-[1400px]">
        <BlogGridWithFilters allPosts={allPosts} />
      </div>

      {/* Final CTA Section */}
      <FinalCTASection buttonLocation="blog_final_cta" />
    </main>
  );
}
