"use client";

import { cn } from "@/lib/utils";
import { useOnboarding, TOTAL_STEPS } from "../onboarding-context";

export function OnboardingMobileHeader() {
  const { step } = useOnboarding();

  return (
    <div
      className={cn(
        "lg:hidden px-4 pt-4 pb-3 sticky top-0 z-10 bg-background flex flex-col items-center gap-3",
        step === 0 && "hidden"
      )}
    >
      <p className="text-sm font-semibold text-foreground">
        Step {step} of {TOTAL_STEPS}
      </p>
      {/* Step dashes */}
      <div className="flex items-center gap-1.5 w-full">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-[2px] flex-1 rounded-full transition-colors duration-300",
              i + 1 === step ? "bg-foreground" : i + 1 < step ? "bg-success" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
