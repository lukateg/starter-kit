import { ErrorState } from "./error-state";

interface UnauthorizedStateProps {
  projectName?: string;
}

/**
 * Unauthorized State Component
 *
 * Specific component for displaying access denial.
 * Shows when a user tries to access content they don't have permission for.
 *
 * @example
 * ```tsx
 * // Without project name
 * <UnauthorizedState />
 *
 * // With project name for more context
 * <UnauthorizedState projectName="My Project" />
 * ```
 */
export function UnauthorizedState({ projectName }: UnauthorizedStateProps) {
  const description = projectName
    ? `You don't have access to "${projectName}". Contact the project owner for an invitation.`
    : "You don't have access to this content. Contact the project owner for an invitation.";

  return (
    <ErrorState
      title="Access Denied"
      description={description}
      icon="unauthorized"
      action={{
        label: "Go to Dashboard",
        href: "/dashboard",
      }}
    />
  );
}
