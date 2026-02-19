/**
 * Frontend Error Helpers
 *
 * Utilities for extracting and handling errors from Convex responses.
 * Works with structured ConvexError data from the backend.
 *
 * See DOCS/ERROR_HANDLING.md for full documentation.
 */

import { ConvexError } from "convex/values";

// ============================================================================
// Types
// ============================================================================

/**
 * Structure of error data from the backend
 */
export interface AppErrorData {
  code: string;
  message?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an error is our structured app error (ConvexError with code)
 */
export function isAppError(
  error: unknown
): error is ConvexError<{ code: string; message: string | undefined }> {
  return (
    error instanceof ConvexError &&
    typeof (error.data as AppErrorData)?.code === "string"
  );
}

// ============================================================================
// Error Extractors
// ============================================================================

/**
 * Extract the error code from an error
 *
 * @returns The error code if it's an app error, "SERVER_ERROR" otherwise
 */
export function getErrorCode(error: Error | undefined): string | null {
  if (!error) return null;

  if (isAppError(error)) {
    return error.data.code;
  }

  // For non-structured errors, default to SERVER_ERROR
  return "SERVER_ERROR";
}

/**
 * Extract the error message from an error
 *
 * For app errors, uses the structured message.
 * For other errors, uses the error's message property.
 */
export function getErrorMessage(error: Error | undefined): string {
  if (!error) return "";

  if (isAppError(error)) {
    return error.data.message ?? "An error occurred";
  }

  return error.message ?? "An unexpected error occurred";
}

/**
 * Get a user-friendly message based on error code
 *
 * Use this for displaying errors in toasts or inline messages.
 */
export function getUserFriendlyMessage(error: Error | undefined): string {
  const code = getErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Please sign in to continue.";
    case "UNAUTHORIZED":
      return "You don't have access to this resource.";
    case "NOT_FOUND":
      return "The requested resource was not found.";
    case "VALIDATION_ERROR":
      return getErrorMessage(error); // Use specific validation message
    case "SERVER_ERROR":
    default:
      return "Something went wrong. Please try again.";
  }
}
