import { Button } from "@/components/ui/button";
import { AlertTriangle, FileQuestion, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

type ErrorIcon = "error" | "warning" | "not-found" | "unauthorized";

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: ErrorIcon;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

const iconMap: Record<
  ErrorIcon,
  { icon: typeof AlertTriangle; bgColor: string; iconColor: string }
> = {
  error: {
    icon: AlertTriangle,
    bgColor: "bg-danger/10",
    iconColor: "text-danger",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
  },
  "not-found": {
    icon: FileQuestion,
    bgColor: "bg-muted",
    iconColor: "text-muted-foreground/60",
  },
  unauthorized: {
    icon: Lock,
    bgColor: "bg-muted",
    iconColor: "text-muted-foreground",
  },
};

/**
 * Reusable Error State Component
 *
 * Flexible error display for inline use within pages.
 * Use this when you need to show an error state within a page content area.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="Something Went Wrong"
 *   description="We couldn't load your data."
 *   icon="error"
 *   action={{ label: "Try Again", onClick: () => refetch() }}
 *   secondaryAction={{ label: "Go Back", href: "/dashboard" }}
 * />
 * ```
 */
export function ErrorState({
  title,
  description,
  icon = "error",
  action,
  secondaryAction,
}: ErrorStateProps) {
  const { icon: IconComponent, bgColor, iconColor } = iconMap[icon];

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className={`mb-6 rounded-full ${bgColor} p-4`}>
          <IconComponent className={`h-12 w-12 ${iconColor}`} />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {(action || secondaryAction) && (
          <div className="flex gap-3">
            {action && (
              <>
                {action.href ? (
                  <Button asChild>
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ) : (
                  <Button onClick={action.onClick}>{action.label}</Button>
                )}
              </>
            )}
            {secondaryAction && (
              <>
                {secondaryAction.href ? (
                  <Button variant="outline" asChild>
                    <Link href={secondaryAction.href}>
                      {secondaryAction.label}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
