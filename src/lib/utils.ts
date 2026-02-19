import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Article/Keyword intent types as defined in the schema.
 * @see convex/schema.ts - keywords.intent field
 */
export type ArticleIntent =
  | "how-to"
  | "listicle"
  | "guide"
  | "comparison"
  | "review"
  | "deep-dive";

/**
 * Returns Tailwind CSS classes for styling intent badges with distinct colors.
 *
 * Color assignments:
 * - how-to: Blue (primary) - instructional content
 * - listicle: Purple - list-based content
 * - guide: Amber/Orange - comprehensive guides
 * - comparison: Green (success) - comparison content
 * - review: Pink - review/opinion content
 * - deep-dive: Red (danger) - in-depth analysis
 *
 * @param intent - The article/keyword intent type
 * @returns Tailwind CSS classes for background, text, and hover states
 */
export function getIntentBadgeStyles(intent: string): string {
  switch (intent) {
    case "how-to":
      return "bg-primary/20 text-primary hover:bg-primary/30";
    case "listicle":
      return "bg-[#AA336A]/30 text-purple-[#AA336A] hover:bg-purple-[#AA336A]/30";
    case "guide":
      return "bg-[#CC5500]/15 text-[#CC5500] hover:bg-[#CC5500]/15";
    case "comparison":
      return "bg-success/20 text-success hover:bg-success/30";
    case "review":
      return "bg-pink-100 text-pink-700 hover:bg-pink-200";
    case "deep-dive":
      return "bg-danger/20 text-danger hover:bg-danger/20";
    default:
      return "bg-muted text-foreground/80 hover:bg-muted";
  }
}
