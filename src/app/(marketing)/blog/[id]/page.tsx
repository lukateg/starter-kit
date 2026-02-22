import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { type BlogPost } from "../page";
import { api } from "../../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { FinalCTASection } from "../../components/final-cta-section";

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

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Your App";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

// Helper function to generate Article schema for SEO
function generateArticleSchema(post: BlogPost, slug: string, publishTimestamp: number) {
  const canonicalUrl = `${appUrl}/blog/${slug}`;
  const imageUrl = post.image.startsWith("http")
    ? post.image
    : `${appUrl}${post.image}`;
  const isoDate = new Date(publishTimestamp).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.title,
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: appName,
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };
}

// Helper function to extract FAQ Q&A pairs from article HTML and generate FAQPage schema
function generateFaqSchema(htmlContent: string) {
  // FAQ headings across all supported languages
  const faqHeadings = [
    "Frequently Asked Questions",
    "Häufig gestellte Fragen",
    "Questions fréquemment posées",
    "Preguntas frecuentes",
    "Domande frequenti",
    "Veelgestelde vragen",
    "Perguntas frequentes",
    "Često postavljana pitanja",
  ];

  // Find the FAQ section: look for <h2> with a known FAQ heading
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  let faqStartIndex = -1;
  let match;

  while ((match = h2Regex.exec(htmlContent)) !== null) {
    const headingText = match[1].trim();
    if (faqHeadings.some((fh) => headingText.toLowerCase() === fh.toLowerCase())) {
      faqStartIndex = match.index + match[0].length;
      break;
    }
  }

  if (faqStartIndex === -1) return null;

  // Get content after the FAQ h2 until the next h2 or end of content
  const restContent = htmlContent.slice(faqStartIndex);
  const nextH2Index = restContent.search(/<h2[^>]*>/i);
  const faqContent = nextH2Index !== -1 ? restContent.slice(0, nextH2Index) : restContent;

  // Extract Q&A pairs: each <h3> is a question, content until next <h3> is the answer
  const qaPairs: { question: string; answer: string }[] = [];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  const h3Matches: { question: string; index: number; length: number }[] = [];

  let h3Match;
  while ((h3Match = h3Regex.exec(faqContent)) !== null) {
    // Strip any HTML tags from the question text
    const questionText = h3Match[1].replace(/<[^>]+>/g, "").trim();
    h3Matches.push({
      question: questionText,
      index: h3Match.index,
      length: h3Match[0].length,
    });
  }

  for (let i = 0; i < h3Matches.length; i++) {
    const answerStart = h3Matches[i].index + h3Matches[i].length;
    const answerEnd = i + 1 < h3Matches.length ? h3Matches[i + 1].index : faqContent.length;
    const answerHtml = faqContent.slice(answerStart, answerEnd).trim();
    // Strip HTML tags for plain text answer
    const answerText = answerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (h3Matches[i].question && answerText) {
      qaPairs.push({ question: h3Matches[i].question, answer: answerText });
    }
  }

  if (qaPairs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qaPairs.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
      },
    })),
  };
}

// Helper function to generate BreadcrumbList schema for SEO
function generateBreadcrumbSchema(post: BlogPost, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${appUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${appUrl}/blog/${slug}`,
      },
    ],
  };
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

// Helper to get post by ID from Convex
async function getPostById(id: string): Promise<{ post: BlogPost; publishTimestamp: number } | null> {
  try {
    const convexArticle = await fetchQuery(api.blogArticles.getArticleBySlug, {
      slug: id,
    });
    if (convexArticle) {
      return {
        post: convertToBlogPost(convexArticle),
        publishTimestamp: convexArticle.publishDate,
      };
    }
  } catch (error) {
    console.error("Error fetching from Convex:", error);
  }

  return null;
}

// Force static generation at build time
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  try {
    const articles = await fetchQuery(api.blogArticles.getPublishedArticles);
    return articles.map((article) => ({
      id: article.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for blog:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const result = await getPostById(id);

  if (!result) {
    return {
      title: "Post Not Found",
    };
  }

  const { post, publishTimestamp } = result;
  const canonicalUrl = `${appUrl}/blog/${id}`;
  const isoDate = new Date(publishTimestamp).toISOString();

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      post.category,
    ],
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
      publishedTime: isoDate,
      authors: [post.author.name],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const result = await getPostById(id);

  if (!result) {
    notFound();
  }

  const { post, publishTimestamp } = result;

  // Get all posts for related articles
  let allPosts: BlogPost[] = [];
  try {
    const convexArticles = await fetchQuery(
      api.blogArticles.getPublishedArticles
    );
    allPosts = convexArticles.map(convertToBlogPost);
  } catch (error) {
    console.error("Error fetching related articles:", error);
  }

  // Generate structured data for SEO
  const articleSchema = generateArticleSchema(post, id, publishTimestamp);
  const breadcrumbSchema = generateBreadcrumbSchema(post, id);
  const faqSchema = generateFaqSchema(post.content);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      <main className="min-h-screen bg-background">
        <div className="border-b p-4">
        <header className="container mx-auto px-4 py-6 max-w-[1400px]">
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <svg
              viewBox="0 0 18 27"
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.397 25.426l13.143-11.5-13.143-11.5"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-foreground">{post.title}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-8">
              <div>
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                  {post.title}
                </h1>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <span>{post.date}</span>
                <span className="flex items-center gap-2">
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
                  {post.readTime}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {post.category}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {post.author.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {post.author.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          </div>
        </header>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-[1400px] pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-8">
          {/* Main Content */}
          <article className="lg:col-span-2 prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="article-content"
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block px-8">
            <div className="sticky top-24">
              <div className="relative border border-border text-foreground rounded-xl p-6 text-center">
                <p className="text-2xl font-semibold mb-3">
                  Get started today
                </p>
                <p className="text-muted-foreground mb-6">
                  Sign up for free and see what we can do for you.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign up free
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 w-5 h-5"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-muted py-16 mt-16">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allPosts
              .filter((p: BlogPost) => p.id !== post.id)
              .slice(0, 2)
              .map((relatedPost: BlogPost) => {
                return (
                  <article
                    key={relatedPost.id}
                    className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/blog/${relatedPost.id}`}>
                      <div
                        className={`relative aspect-[16/9] overflow-hidden rounded-sm`}
                      >
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          loading="lazy"
                          className="object-cover hover:scale-105 transition-transform duration-300 rounded-sm"
                        />
                      </div>
                    </Link>
                    <div className="p-6">
                      <Link href={`/blog/${relatedPost.id}`}>
                        <h4 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                        <span>{relatedPost.date}</span>
                        <span>{relatedPost.readTime}</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <FinalCTASection buttonLocation="blog_article_final_cta" />
    </main>
    </>
  );
}
