import type { Metadata } from "next";
import { Geist, Geist_Mono, Jost } from "next/font/google";
import "./globals.css";
import { PHProvider } from "./providers/PostHogProvider";
import { MetaPixelProvider } from "./providers/MetaPixelProvider";
import { ConvexClientProvider } from "./providers/ConvexClientProvider";
import { AuthProvider } from "@/contexts/auth-context";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Your App - SaaS Starter Kit",
    template: "%s | Your App",
  },
  description:
    "Build your SaaS product faster with a production-ready starter kit",
  keywords: [
    "SaaS",
    "starter kit",
    "Next.js",
    "React",
    "Convex",
    "web application",
    "boilerplate",
    "template",
  ],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
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
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "Your App - SaaS Starter Kit",
    description:
      "Build your SaaS product faster with a production-ready starter kit",
    siteName: "Your App",
    images: [
      {
        url: "/og-image.png",
        width: 1366,
        height: 768,
        alt: "Your App - SaaS Starter Kit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your App - SaaS Starter Kit",
    description:
      "Build your SaaS product faster with a production-ready starter kit",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

// Organization schema for search engines
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Your Company",
  url: appUrl,
  logo: `${appUrl}/logo.png`,
  description:
    "Your company description goes here.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@yourcompany.com",
  },
};

// WebSite schema for sitelinks searchbox
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Your App",
  url: appUrl,
  description:
    "Build your SaaS product faster with a production-ready starter kit.",
  publisher: {
    "@type": "Organization",
    name: "Your Company",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Preconnect to your Clerk domain for faster auth loading */}
        {/* Replace with your Clerk frontend API domain: https://clerk.your-domain.com */}
        <link rel="preconnect" href="https://clerk.clerk.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://clerk.clerk.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <PHProvider>
              <MetaPixelProvider>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </MetaPixelProvider>
            </PHProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
