"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-muted group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-muted-foreground/30 group-[.toaster]:shadow-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-accent group-[.toast]:text-muted-foreground group-[.toast]:border group-[.toast]:border-border",
          success:
            "group-[.toaster]:border-success/30 group-[.toaster]:bg-success/5 [&>svg]:text-success",
          error:
            "group-[.toaster]:border-danger/30 group-[.toaster]:bg-danger/5 [&>svg]:text-danger",
          warning:
            "group-[.toaster]:border-warning/30 group-[.toaster]:bg-warning/5 [&>svg]:text-warning",
          info: "group-[.toaster]:border-info/30 group-[.toaster]:bg-info/5 [&>svg]:text-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
