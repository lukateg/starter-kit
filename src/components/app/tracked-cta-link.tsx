"use client";

import Link from "next/link";
import { useMetaPixel } from "@/app/hooks/useMetaPixel";
import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaLinkVariants = cva(
  "inline-flex text-foreground cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white bg-foreground shadow hover:bg-foreground/90",
        primary: "text-white bg-primary shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        danger:
          "bg-red-50 text-red-700 border border-red-300 shadow-sm hover:bg-red-100 hover:text-red-800",
        outline:
          "border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface TrackedCTALinkProps extends VariantProps<typeof ctaLinkVariants> {
  href: string;
  children: ReactNode;
  className?: string;
  eventData?: Record<string, unknown>;
}

/**
 * A Link component that tracks Meta Pixel Lead events when clicked
 * Use this for all CTA buttons that lead to sign-up or conversion pages
 * Supports the same variant and size props as the Button component
 */
export function TrackedCTALink({
  href,
  children,
  className,
  variant,
  size,
  eventData = {},
}: TrackedCTALinkProps) {
  const { trackEvent } = useMetaPixel();

  const handleClick = () => {
    // Track Lead event on Meta Pixel
    trackEvent("Lead", {
      content_name: typeof children === "string" ? children : "CTA Click",
      content_category: "Sign Up",
      source: window.location.pathname,
      ...eventData,
    });
  };

  return (
    <Link
      href={href}
      className={cn(ctaLinkVariants({ variant, size, className }))}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
