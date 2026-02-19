/**
 * Retry utility with exponential backoff
 * Handles transient API failures (like Gemini image generation)
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds (default: 1000ms)
   * Doubles with each retry (exponential backoff)
   */
  initialDelay?: number;

  /**
   * Maximum delay between retries in milliseconds (default: 10000ms)
   */
  maxDelay?: number;

  /**
   * Custom function to determine if error is retryable
   * If not provided, all errors are considered retryable
   */
  isRetryable?: (error: unknown) => boolean;

  /**
   * Callback called before each retry attempt
   */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Default error check - considers these errors as retryable:
 * - Network errors
 * - Timeout errors
 * - 5xx server errors
 * - Gemini API "No content parts" errors
 */
function defaultIsRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Gemini-specific errors that are transient
    if (message.includes("no content parts")) return true;
    if (message.includes("no image data")) return true;
    if (message.includes("timeout")) return true;
    if (message.includes("network")) return true;
    if (message.includes("econnrefused")) return true;
    if (message.includes("enotfound")) return true;

    // Server errors (5xx)
    if (message.includes("500")) return true;
    if (message.includes("502")) return true;
    if (message.includes("503")) return true;
    if (message.includes("504")) return true;

    // Rate limits (should retry with backoff)
    if (message.includes("rate limit")) return true;
    if (message.includes("too many requests")) return true;
    if (message.includes("429")) return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Promise resolving to the function's result
 * @throws Last error if all retries fail
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => convex.action(api.images.generate, { ... }),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => {
 *       console.log(`Retry attempt ${attempt}:`, error);
 *     }
 *   }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!isRetryable(error)) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Double the delay for next attempt (capped at maxDelay)
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}

/**
 * Retry with specific configuration for Gemini image generation
 * Pre-configured with sensible defaults for AI image generation
 */
export async function retryImageGeneration<T>(
  fn: () => Promise<T>,
  imageName: string = "image"
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 2000, // Start with 2s (Gemini rate limits)
    maxDelay: 8000, // Cap at 8s
    onRetry: (attempt, error) => {
      console.warn(
        `  ⚠ Retry ${attempt}/3 for ${imageName}:`,
        error instanceof Error ? error.message : String(error)
      );
    },
  });
}
