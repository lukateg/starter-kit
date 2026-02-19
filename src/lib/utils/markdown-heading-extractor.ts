/**
 * Markdown Heading Extraction Utilities
 *
 * Utilities for extracting section headings that precede image placeholders
 * to provide better financial context for image generation.
 */

/**
 * Extract the heading that immediately precedes an image placeholder
 *
 * @param markdown - The full Markdown content
 * @param imagePlaceholder - The full image placeholder text (e.g., "{{IMAGE: description}}" or "![alt](placeholder)")
 * @returns The text of the preceding heading (h2, h3, h4) or null if not found
 */
export function extractPrecedingHeading(
  markdown: string,
  imagePlaceholder: string
): string | null {
  // Find the position of the image placeholder
  const placeholderIndex = markdown.indexOf(imagePlaceholder);
  if (placeholderIndex === -1) {
    return null;
  }

  // Get the Markdown content before the placeholder
  const markdownBeforePlaceholder = markdown.substring(0, placeholderIndex);

  // Find the last heading (h2, h3, or h4) before the placeholder
  // Look for headings in reverse order (closest to placeholder first)
  // Matches:
  // ## Heading 2
  // ### Heading 3
  // #### Heading 4
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; index: number }> = [];

  let match;
  while ((match = headingRegex.exec(markdownBeforePlaceholder)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      index: match.index,
    });
  }

  // Get the closest heading (last one found)
  if (headings.length === 0) {
    return null;
  }

  const closestHeading = headings[headings.length - 1];

  // Strip Markdown formatting from heading text (in case there are **bold**, *italic*, etc.)
  const cleanText = closestHeading.text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links: [text](url) -> text
    .replace(/[*_~`]/g, "") // Remove bold, italic, strikethrough, code
    .trim();

  return cleanText || null;
}

/**
 * Extract all image placeholders with their preceding headings
 *
 * @param markdown - The full Markdown content
 * @returns Array of objects containing placeholder, description, and preceding heading
 */
export function extractImagePlaceholdersWithHeadings(markdown: string): Array<{
  fullMatch: string;
  description: string;
  precedingHeading: string | null;
}> {
  // Helper to extract regex matches
  const extractMatches = (regex: RegExp, getDescription: (match: RegExpExecArray) => string) => {
    const results: Array<{
      fullMatch: string;
      description: string;
      precedingHeading: string | null;
    }> = [];

    let match;
    // Reset lastIndex because regex is global/sticky might be reused (though here it's fresh)
    regex.lastIndex = 0;
    while ((match = regex.exec(markdown)) !== null) {
      const fullMatch = match[0];
      const description = getDescription(match).trim();
      const precedingHeading = extractPrecedingHeading(markdown, fullMatch);

      results.push({
        fullMatch,
        description,
        precedingHeading,
      });
    }
    return results;
  };

  // Pattern 1: {{IMAGE: description}}
  const explicitPlaceholderResults = extractMatches(
    /\{\{IMAGE:\s*([^}]+)\}\}/g,
    (match) => match[1]
  );

  // Pattern 2: ![description](placeholder)
  // We look for standard markdown image syntax where the URL is "placeholder"
  const standardPlaceholderResults = extractMatches(
    /!\[([^\]]*)\]\(placeholder\)/g,
    (match) => match[1] || "illustration" // Use alt text or default
  );

  return [...explicitPlaceholderResults, ...standardPlaceholderResults];
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
