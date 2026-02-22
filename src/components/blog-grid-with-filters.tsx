"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/app/(marketing)/blog/page";

interface BlogGridWithFiltersProps {
  allPosts: BlogPost[];
}

export function BlogGridWithFilters({ allPosts }: BlogGridWithFiltersProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Latest Updates");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(allPosts.map((post) => post.category).filter(Boolean))
    ).sort();
    return ["Latest Updates", ...uniqueCategories];
  }, [allPosts]);

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Latest Updates") {
      // Skip first article (featured article shown above)
      return allPosts.slice(1);
    }
    return allPosts.filter((post) => post.category === selectedCategory);
  }, [allPosts, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const displayedPosts = filteredPosts.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when changing categories
  };

  return (
    <>
      {/* Category Tabs */}
      <div className="border-b border-border mb-8">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  pb-4 px-1 text-sm font-medium whitespace-nowrap transition-colors relative
                  text-foreground
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedPosts.map((post) => (
          <article
            key={post.id}
            className="group bg-background border border-border rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/blog/${post.id}`}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-sm"
                />
              </div>
            </Link>

            <div className="p-6">
              {/* Reading time */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
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
                <span>Reading time {post.readTime}</span>
              </div>

              {/* Title */}
              <Link href={`/blog/${post.id}`}>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>

              {/* Excerpt */}
              <Link href={`/blog/${post.id}`}>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>

              {/* Meta */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">{post.date}</div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {post.author.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {post.author.title}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum as number)}
                className={`
                  px-4 py-2 font-medium transition-colors
                  ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
