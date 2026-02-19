/**
 * Error Handling Utilities for Convex Backend
 *
 * This module provides structured error handling using ConvexError.
 * All errors thrown use the createAppError utility which wraps
 * error data in a type-safe structure.
 *
 * See DOCS/ERROR_HANDLING.md for full documentation.
 */

import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED", // User not logged in
  UNAUTHORIZED: "UNAUTHORIZED", // User lacks permission
  NOT_FOUND: "NOT_FOUND", // Resource doesn't exist
  VALIDATION_ERROR: "VALIDATION_ERROR", // Invalid input
  SERVER_ERROR: "SERVER_ERROR", // Unexpected failures
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// Error Data Structure
// ============================================================================

export interface AppErrorData {
  code: ErrorCode;
  message?: string;
}

// ============================================================================
// Error Creation
// ============================================================================

/**
 * Create a structured ConvexError with error code and optional message
 *
 * @param code - The error code (from ERROR_CODES)
 * @param message - Optional human-readable message
 * @returns ConvexError with structured error data
 */
export function createAppError(
  code: ErrorCode,
  message?: string
): ConvexError<{ code: string; message: string | undefined }> {
  return new ConvexError({ code, message });
}

// ============================================================================
// Convenience Throw Functions
// ============================================================================

/**
 * Throw an UNAUTHENTICATED error
 * Use when user is not logged in or session has expired
 */
export function throwUnauthenticated(message?: string): never {
  throw createAppError(
    ERROR_CODES.UNAUTHENTICATED,
    message ?? "Please sign in to continue"
  );
}

/**
 * Throw an UNAUTHORIZED error
 * Use when user lacks permission (not project member, not owner, feature not on plan)
 */
export function throwUnauthorized(message?: string): never {
  throw createAppError(
    ERROR_CODES.UNAUTHORIZED,
    message ?? "You don't have access to this resource"
  );
}

/**
 * Throw a NOT_FOUND error
 * Use when a resource doesn't exist (project, article, keyword, etc.)
 */
export function throwNotFound(resource?: string): never {
  throw createAppError(
    ERROR_CODES.NOT_FOUND,
    resource ? `${resource} not found` : "Resource not found"
  );
}

/**
 * Throw a VALIDATION_ERROR
 * Use when input is invalid or missing required fields
 */
export function throwValidationError(message: string): never {
  throw createAppError(ERROR_CODES.VALIDATION_ERROR, message);
}

/**
 * Throw a SERVER_ERROR
 * Use for unexpected failures (database errors, external API failures)
 */
export function throwServerError(message?: string): never {
  throw createAppError(
    ERROR_CODES.SERVER_ERROR,
    message ?? "An unexpected error occurred"
  );
}

// ============================================================================
// Authentication Guard
// ============================================================================

/**
 * Require authentication and return the Clerk ID
 *
 * This is the primary authentication guard for all protected queries/mutations.
 * Call this at the start of any function that requires a logged-in user.
 *
 * @param ctx - The Convex context (QueryCtx, MutationCtx, or ActionCtx)
 * @returns The user's Clerk ID (subject from identity)
 * @throws UNAUTHENTICATED if user is not logged in
 *
 * @example
 * ```ts
 * export const myQuery = query({
 *   handler: async (ctx) => {
 *     const clerkId = await requireAuth(ctx);
 *     // User is authenticated, clerkId is available
 *   },
 * });
 * ```
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throwUnauthenticated();
  }
  return identity.subject;
}
