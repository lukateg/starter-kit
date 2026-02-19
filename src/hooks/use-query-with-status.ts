/**
 * Query Hook with Status
 *
 * Wrapper around useQuery that provides status information.
 * Uses convex-helpers to get { data, isPending, isError, error } instead of just data.
 *
 * See DOCS/ERROR_HANDLING.md for full documentation.
 */

import { useQueries } from "convex/react";
import { makeUseQueryWithStatus } from "convex-helpers/react";

/**
 * useQueryWithStatus - Enhanced useQuery with status information
 *
 * Instead of returning just `data | undefined`, this hook returns:
 * - status: "pending" | "success" | "error"
 * - data: TData | undefined
 * - error: Error | undefined
 * - isPending: boolean
 * - isSuccess: boolean
 * - isError: boolean
 *
 * @example
 * ```tsx
 * const article = useQueryWithStatus(api.articles.get, { articleId });
 *
 * if (article.isPending) return <Skeleton />;
 * if (article.isError) return <ErrorState error={article.error} />;
 * return <ArticleContent article={article.data} />;
 * ```
 *
 * @example With QueryState component
 * ```tsx
 * const article = useQueryWithStatus(api.articles.get, { articleId });
 *
 * return (
 *   <QueryState query={article} pending={<Skeleton />}>
 *     {(data) => <ArticleContent article={data} />}
 *   </QueryState>
 * );
 * ```
 */
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

/**
 * Type for the query result returned by useQueryWithStatus
 */
export type QueryResult<TData> = {
  status: "pending" | "success" | "error";
  data: TData | undefined;
  error: Error | undefined;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
};
