"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackButtonProps {
  onClick: () => void;
  className?: string;
}

export function FeedbackButton({ onClick, className }: FeedbackButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "px-4 py-2",
        className
      )}
      title="Send Feedback"
    >
      Feedback
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
