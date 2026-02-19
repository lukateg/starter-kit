"use client";

import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

/**
 * Global 404 Page
 *
 * Displayed when a user navigates to a route that doesn't exist.
 * This page renders without the app sidebar/header since it's at the root level.
 *
 * If the user is authenticated, redirects to /app (which will pick their project).
 * If not authenticated, redirects to the landing page.
 */
export default function NotFound() {
  const { isSignedIn, isLoaded } = useAuth();

  // Determine where to send the user based on auth state
  const homeHref = isLoaded && isSignedIn ? "/app" : "/";
  const buttonText = isLoaded && isSignedIn ? "Go to Dashboard" : "Go to Home";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-gray-100 p-4">
          <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Page Not Found
        </h1>
        <p className="mb-6 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link href={homeHref}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}
