import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/unsubscribe(.*)",
  "/sitemap.xml", // Sitemap for SEO
  "/robots.txt", // Robots file for SEO
  "/api/webhooks(.*)", // Webhook endpoints (no Clerk auth, validated via API key in route handler)
  "/ingest(.*)", // PostHog analytics reverse proxy
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  // Skip middleware authentication for ALL API routes
  // API routes handle their own authentication via Clerk's auth() or custom validation
  if (pathname.startsWith("/api/")) {
    return;
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers (simplified - CSP removed to avoid maintenance overhead)
  // These headers provide good security without the complexity of CSP
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|ogg|mov)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
