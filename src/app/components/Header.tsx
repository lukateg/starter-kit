"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { TrackedCTALink } from "@/components/app/tracked-cta-link";
import { cn } from "@/lib/utils";

function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Header() {
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    // Only handle smooth scroll if we're on the same page
    if (window.location.pathname === "/") {
      e.preventDefault();
      smoothScrollTo(targetId);
    }
  };

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 bg-white/70 backdrop-blur-md shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 py-4 max-w-[1400px]">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation - aligned left */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900">
                  Your App
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/#pricing"
                onClick={(e) => handleSmoothScroll(e, "pricing")}
                className="text-primary hover:bg-primary/5 cursor-pointer px-2 py-1 transition-colors"
              >
                Pricing
              </Link>

              <Link
                href="/blog"
                className="text-primary hover:bg-primary/5 cursor-pointer px-2 py-1 transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* CTA Button */}
          <TrackedCTALink
            href="/sign-in"
            className="bg-[#1a1a1a]/95 text-white px-6 py-2.5 rounded-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
            eventData={{ button_location: "header" }}
          >
            Sign in
            <Zap className="w-4 h-4" fill="currentColor" />
          </TrackedCTALink>
        </div>
      </div>
    </header>
  );
}
