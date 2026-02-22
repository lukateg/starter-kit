"use client";

import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../onboarding-context";

export function StepIntro() {
  const { setStep } = useOnboarding();

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Rocket className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Welcome! Let&apos;s set up your project.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          We&apos;ll walk you through a quick setup so you can hit the ground running.
          It only takes a minute.
        </p>
      </div>

      <Button
        onClick={() => setStep(1)}
        className="px-8 py-3 text-base"
      >
        Get Started
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <p className="text-xs text-muted-foreground max-w-sm">
        You can always update these settings later from your project settings page.
      </p>
    </div>
  );
}
