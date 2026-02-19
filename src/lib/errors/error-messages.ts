/**
 * User-Friendly Error Messages
 *
 * Maps error codes to user-friendly messages.
 * See DOCS/ERROR_HANDLING.md for full documentation.
 */

import { ERROR_CODES, type ErrorCode } from "./error-types";

export interface ErrorMessage {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
  };
}

export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  [ERROR_CODES.UNAUTHENTICATED]: {
    title: "Sign In Required",
    description: "Please sign in to access this page.",
    action: { label: "Sign In", href: "/sign-in" },
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    title: "Access Denied",
    description:
      "You don't have access to this content. Contact the project owner for an invitation.",
    action: { label: "Go to Calendar", href: "/app?redirect=calendar" },
  },
  [ERROR_CODES.NOT_FOUND]: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    action: { label: "Go to Calendar", href: "/app?redirect=calendar" },
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    title: "Invalid Input",
    description: "Please check your input and try again.",
  },
  [ERROR_CODES.SERVER_ERROR]: {
    title: "Something Went Wrong",
    description:
      "We encountered an unexpected error. Please try again. If the problem persists, contact support.",
  },
};

/**
 * Get a user-friendly error message for an error code
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return ERROR_MESSAGES[code];
}

/**
 * Get a short description suitable for toast notifications
 */
export function getToastMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code].description;
}
