/**
 * Error Types and Parsing Utilities
 *
 * Unified error handling system for the app.
 * See DOCS/ERROR_HANDLING.md for full documentation.
 */

export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED", // User not logged in
  UNAUTHORIZED: "UNAUTHORIZED", // User lacks permission
  NOT_FOUND: "NOT_FOUND", // Resource doesn't exist
  VALIDATION_ERROR: "VALIDATION_ERROR", // Invalid input
  SERVER_ERROR: "SERVER_ERROR", // Unexpected failures
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ParsedError {
  code: ErrorCode;
  isRecoverable: boolean;
  originalMessage: string;
}

/**
 * Parse Convex error messages and map to error codes
 *
 * This utility extracts error codes from Convex error messages
 * using pattern matching. It returns a structured error object
 * that can be used to display user-friendly messages.
 *
 * @param error - The error to parse (can be Error, string, or unknown)
 * @returns ParsedError with code, recoverability, and original message
 */
export function parseConvexError(error: unknown): ParsedError {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Check for unauthenticated
  if (lowerMessage.includes("unauthenticated")) {
    return {
      code: ERROR_CODES.UNAUTHENTICATED,
      isRecoverable: true,
      originalMessage: message,
    };
  }

  // Check for unauthorized/permission errors
  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("don't have access") ||
    lowerMessage.includes("only the owner") ||
    lowerMessage.includes("only the project owner") ||
    lowerMessage.includes("access denied") ||
    lowerMessage.includes("permission denied") ||
    lowerMessage.includes("not a member")
  ) {
    return {
      code: ERROR_CODES.UNAUTHORIZED,
      isRecoverable: false,
      originalMessage: message,
    };
  }

  // Check for not found errors
  if (lowerMessage.includes("not found")) {
    return {
      code: ERROR_CODES.NOT_FOUND,
      isRecoverable: false,
      originalMessage: message,
    };
  }

  // Check for validation errors
  if (
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("required") ||
    lowerMessage.includes("validation") ||
    lowerMessage.includes("must be") ||
    lowerMessage.includes("cannot be empty")
  ) {
    return {
      code: ERROR_CODES.VALIDATION_ERROR,
      isRecoverable: true,
      originalMessage: message,
    };
  }

  // Default to server error
  return {
    code: ERROR_CODES.SERVER_ERROR,
    isRecoverable: false,
    originalMessage: message,
  };
}
