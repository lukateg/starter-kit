"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingProvider, useOnboarding, stepDetails, TOTAL_STEPS } from "./onboarding-context";
import { OnboardingSidebar } from "./components/onboarding-sidebar";
import { OnboardingMobileHeader } from "./components/onboarding-mobile-header";
import { StepIntro } from "./components/step-intro";
import { StepProjectBasics } from "./components/step-project-basics";
import { StepPreferences } from "./components/step-preferences";
import { StepComplete } from "./components/step-complete";

function OnboardingContent() {
  const router = useRouter();
  const {
    step,
    handleNext,
    handleBack,
    isSubmitting,
    error,
    hasProjects,
    projects,
  } = useOnboarding();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <OnboardingSidebar />
      <OnboardingMobileHeader />

      {/* Right Content Area (2/3 on desktop, full width on mobile and intro) */}
      <div className={cn("w-full p-4 sm:p-6 lg:p-8 flex items-start lg:items-center justify-center overflow-y-auto lg:min-h-screen bg-white relative", step !== 0 && "lg:w-2/3")}>
        {hasProjects && projects && (
          <Button
            variant="outline"
            className="hidden lg:flex fixed top-6 right-6 border-danger hover:text-foreground z-50"
            onClick={() => router.push(`/projects/${projects[0]._id}/dashboard`)}
          >
            <X className="h-16 w-16 text-danger" />
          </Button>
        )}
        <div className="w-full max-w-2xl py-4 lg:py-8">
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-6 px-0">
              {/* Mobile Step Title */}
              {step > 0 && (
                <div className="lg:hidden mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {stepDetails[step - 1]?.heading}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stepDetails[step - 1]?.description}
                  </p>
                </div>
              )}

              {/* Step Components */}
              {step === 0 && <StepIntro />}
              {step === 1 && <StepProjectBasics />}
              {step === 2 && <StepPreferences />}
              {step === 3 && <StepComplete />}
            </CardContent>

            {error && (
              <div className="px-0 pb-4">
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
                  {error}
                </div>
              </div>
            )}

            <div className="px-0 pb-0 flex flex-row justify-between gap-3 sm:gap-0">
              {step > 1 && step < TOTAL_STEPS && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {step >= 1 && step < TOTAL_STEPS && (
                <Button
                  className="w-full sm:w-auto bg-foreground text-white hover:bg-foreground/90"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Go back link - mobile only */}
            {hasProjects && projects && (
              <div className="lg:hidden flex justify-center pt-4">
                <button
                  onClick={() => router.push(`/projects/${projects[0]._id}/dashboard`)}
                  className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Go back to home page
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
