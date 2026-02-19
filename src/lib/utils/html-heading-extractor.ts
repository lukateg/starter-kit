/**
 * HTML Heading Extraction Utilities
 *
 * Utilities for extracting section headings that precede image placeholders
 * to provide better context for image generation.
 */

/**
 * Extract the heading that immediately precedes an image placeholder
 *
 * @param html - The full HTML content
 * @param imagePlaceholder - The full image placeholder text (e.g., "{{IMAGE: description}}")
 * @returns The text of the preceding heading (h2, h3, h4) or null if not found
 */
export function extractPrecedingHeading(
  html: string,
  imagePlaceholder: string
): string | null {
  // Find the position of the image placeholder
  const placeholderIndex = html.indexOf(imagePlaceholder);
  if (placeholderIndex === -1) {
    return null;
  }

  // Get the HTML content before the placeholder
  const htmlBeforePlaceholder = html.substring(0, placeholderIndex);

  // Find the last heading (h2, h3, or h4) before the placeholder
  // Look for headings in reverse order (closest to placeholder first)
  const headingRegex = /<h([234])[^>]*>(.*?)<\/h\1>/gi;
  const headings: Array<{ level: number; text: string; index: number }> = [];

  let match;
  while ((match = headingRegex.exec(htmlBeforePlaceholder)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].trim(),
      index: match.index,
    });
  }

  // Get the closest heading (last one found)
  if (headings.length === 0) {
    return null;
  }

  const closestHeading = headings[headings.length - 1];

  // Strip HTML tags from heading text (in case there are <strong>, <em>, etc.)
  const cleanText = closestHeading.text.replace(/<[^>]+>/g, "").trim();

  return cleanText || null;
}

/**
 * Extract all image placeholders with their preceding headings
 *
 * @param html - The full HTML content
 * @returns Array of objects containing placeholder, description, and preceding heading
 */
export function extractImagePlaceholdersWithHeadings(html: string): Array<{
  fullMatch: string;
  description: string;
  precedingHeading: string | null;
}> {
  const imagePlaceholderRegex = /\{\{IMAGE:\s*([^}]+)\}\}/g;
  const results: Array<{
    fullMatch: string;
    description: string;
    precedingHeading: string | null;
  }> = [];

  let match;
  while ((match = imagePlaceholderRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const description = match[1].trim();
    const precedingHeading = extractPrecedingHeading(html, fullMatch);

    results.push({
      fullMatch,
      description,
      precedingHeading,
    });
  }

  return results;
}

/**
 * Extract preceding heading for existing <img> tag
 *
 * @param html - The full HTML content
 * @param imgTag - The full <img> tag
 * @returns The text of the preceding heading or null if not found
 */
export function extractPrecedingHeadingForImgTag(
  html: string,
  imgTag: string
): string | null {
  return extractPrecedingHeading(html, imgTag);
}

/**
 * Clean and format heading text for use in image generation prompts
 *
 * @param heading - Raw heading text
 * @returns Cleaned heading text suitable for prompts
 */
export function formatHeadingForPrompt(heading: string | null): string | null {
  if (!heading) {
    return null;
  }

  // Remove numbering (e.g., "1. Step One" -> "Step One")
  let cleaned = heading.replace(/^\d+\.\s*/, "");

  // Remove special characters that might confuse LLM
  cleaned = cleaned.replace(/[#*_~`]/g, "");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned || null;
}
