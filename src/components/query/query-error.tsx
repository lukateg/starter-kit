"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotAuthorized } from "./not-authorized";
import { UnknownError } from "./unknown-error";
import { NotFoundError } from "./not-found-error";

interface QueryErrorProps {
  code: string | null;
  error?: Error;
}

/**
 * QueryError Component
 *
 * Renders the appropriate error UI based on error code.
 * Used internally by QueryState, but can be used directly if needed.
 *
 * Error codes and their UI:
 * - UNAUTHENTICATED → Redirect to sign-in
 * - UNAUTHORIZED → Access denied page
 * - NOT_FOUND → Not found page
 * - VALIDATION_ERROR → Error message
 * - SERVER_ERROR → Generic error page
 */
export function QueryError({ code, error }: QueryErrorProps) {
  const router = useRouter();

  // Handle unauthenticated - redirect to sign in
  useEffect(() => {
    if (code === "UNAUTHENTICATED") {
      router.push("/sign-in");
    }
  }, [code, router]);

  switch (code) {
    case "UNAUTHENTICATED":
      // Redirecting, show nothing
      return null;

    case "UNAUTHORIZED":
      return <NotAuthorized />;

    case "NOT_FOUND":
      return <NotFoundError />;

    case "VALIDATION_ERROR":
      return <UnknownError message="Invalid request. Please check your input." />;

    default:
      return <UnknownError error={error} />;
  }
}
