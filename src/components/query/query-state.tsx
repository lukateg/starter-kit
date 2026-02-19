"use client";

import { ReactNode } from "react";
import { QueryError } from "./query-error";
import { getErrorCode } from "@/lib/errors/error-helpers";

/**
 * Props for the QueryState component
 */
interface QueryStateProps<TData> {
  /**
   * The query result from useQueryWithStatus
   */
  query: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: TData | undefined;
    error: Error | undefined;
  };
  /**
   * Content to show while loading
   */
  pending: ReactNode;
  /**
   * Render function that receives the data when query succeeds.
   * Data is guaranteed to be non-null (null/undefined handled by empty state).
   */
  children: (data: NonNullable<TData>) => ReactNode;
  /**
   * Optional: Content to show when data is empty/null/undefined but no error.
   * If not provided, defaults to NOT_FOUND error UI.
   * Use `null` to render nothing for empty data.
   */
  empty?: ReactNode;
  /**
   * Optional: Custom error renderer. Use this if you need custom error handling.
   * Return undefined to use the default QueryError component.
   */
  renderError?: (error: Error | undefined, code: string | null) => ReactNode | undefined;
}

/**
 * QueryState Component
 *
 * Handles all query states (loading, error, success) in one place.
 * Use this component to wrap content that depends on a query.
 *
 * @example Basic usage:
 * ```tsx
 * const article = useQueryWithStatus(api.articles.get, { articleId });
 *
 * return (
 *   <QueryState query={article} pending={<ArticleSkeleton />}>
 *     {(data) => <ArticleContent article={data} />}
 *   </QueryState>
 * );
 * ```
 *
 * @example With custom empty state:
 * ```tsx
 * <QueryState
 *   query={creditsQuery}
 *   pending={<Spinner />}
 *   empty={null} // Renders nothing if no data
 * >
 *   {(credits) => <CreditDisplay credits={credits} />}
 * </QueryState>
 * ```
 *
 * @example With custom empty component:
 * ```tsx
 * <QueryState
 *   query={articlesQuery}
 *   pending={<ArticleSkeleton />}
 *   empty={<EmptyArticlesList />}
 * >
 *   {(articles) => <ArticlesList articles={articles} />}
 * </QueryState>
 * ```
 */
export function QueryState<TData>({
  query,
  pending,
  children,
  empty,
  renderError,
}: QueryStateProps<TData>) {
  // Loading state
  if (query.isPending) {
    return <>{pending}</>;
  }

  // Error state
  if (query.isError) {
    const errorCode = getErrorCode(query.error);

    // Allow custom error handling
    if (renderError) {
      const customErrorUI = renderError(query.error, errorCode);
      if (customErrorUI !== undefined) {
        return <>{customErrorUI}</>;
      }
    }

    return <QueryError code={errorCode} error={query.error} />;
  }

  // No data - use custom empty state or default to NOT_FOUND error
  if (query.data === undefined || query.data === null) {
    // If empty prop is explicitly provided (even as null), use it
    if (empty !== undefined) {
      return <>{empty}</>;
    }
    // Default: show NOT_FOUND error
    return <QueryError code="NOT_FOUND" />;
  }

  // Success - render children with data
  // At this point, query.data is guaranteed to be non-null
  return <>{children(query.data as NonNullable<TData>)}</>;
}
