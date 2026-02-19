"use client";

import Link from "next/link";
import { Linkedin, Facebook, Instagram } from "lucide-react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../convex/_generated/api";
import { TrackedCTALink } from "@/components/app/tracked-cta-link";

export default function Footer() {
  const articlesQuery = useQueryWithStatus(
    api.blogArticles.getPublishedArticles
  );
  const articles = articlesQuery.data;
  const latestArticles = articles?.slice(0, 4) ?? [];
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-16">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-12 mb-16">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Your App</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/#about"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Find Us On — Replace # links with real profile URLs (see DOCS/FOUNDER/DIGITAL_PRESENCE.md) */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">
              Find Us On
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  G2
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Capterra
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  GetApp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Trustpilot
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Crunchbase
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  AlternativeTo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  SaaSHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  StackShare
                </a>
              </li>
            </ul>
          </div>

          {/* Latest Blog Posts */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">
              Latest Blog Posts
            </h3>
            <ul className="space-y-4">
              {latestArticles.length > 0 ? (
                latestArticles.map((article) => (
                  <li key={article._id}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">No posts yet</li>
              )}
            </ul>
          </div>

          {/* CTA Section */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">
              Ready to get started?
            </h3>
            <div className="space-y-3">
              <TrackedCTALink
                href="/sign-up"
                className="inline-block bg-primary text-white px-6 py-3 font-semibold transition-colors"
                eventData={{ button_location: "footer" }}
              >
                Get Started
              </TrackedCTALink>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            &copy; {new Date().getFullYear()} Your App. All rights reserved.
          </p>

          {/* Social Icons — Replace # links with real profile URLs (see DOCS/FOUNDER/DIGITAL_PRESENCE.md) */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
