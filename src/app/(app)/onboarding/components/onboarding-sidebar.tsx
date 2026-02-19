"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding, stepDetails } from "../onboarding-context";

export function OnboardingSidebar() {
  const { step } = useOnboarding();

  return (
    <div
      className={cn(
        "hidden lg:w-1/3 bg-muted p-6 border-r border-border min-h-screen",
        step === 0 ? "lg:hidden" : "lg:block"
      )}
    >
      <div className="sticky top-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">Setup Your Project</h1>
            <p className="text-xs text-muted-foreground mb-6">
              Complete these steps to get started
            </p>
          </div>
        </div>

        {/* Vertical Stepper */}
        <div className="space-y-4 mt-10">
          {stepDetails.map((stepDetail, index) => {
            const stepNumber = stepDetail.number;
            const isCompleted = stepNumber < step;
            const isCurrent = stepNumber === step;
            const isLast = index === stepDetails.length - 1;

            return (
              <div key={stepNumber} className="relative">
                <div
                  className={cn(
                    "flex items-start",
                    isCurrent ? "gap-4" : "gap-3"
                  )}
                >
                  {/* Step Circle */}
                  <div className="flex flex-col items-center min-w-14">
                    <div
                      className={cn(
                        "relative",
                        isCurrent
                          ? "p-1 border-1 border-success/60 rounded-full border-dashed"
                          : ""
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-full flex items-center justify-center font-semibold transition-all",
                          isCurrent
                            ? "w-10 h-10 text-base"
                            : "w-7 h-7 text-xs",
                          isCompleted
                            ? "bg-success/20 text-success"
                            : isCurrent
                              ? "bg-success text-white"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check
                            className={cn(
                              "text-success",
                              isCurrent ? "h-5 w-5" : "h-4 w-4"
                            )}
                          />
                        ) : (
                          <span>{stepNumber}</span>
                        )}
                      </div>
                    </div>

                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 transition-all",
                          isCurrent
                            ? "h-10 mt-2"
                            : isCompleted
                              ? "h-6 mt-1"
                              : "h-8 mt-1.5",
                          isCompleted ? "bg-success/60" : "bg-muted"
                        )}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div
                    className={cn(
                      "flex-1",
                      isCurrent ? "pb-2" : isCompleted ? "pb-0.5" : "pb-1"
                    )}
                  >
                    <h3
                      className={cn(
                        "font-semibold transition-colors",
                        isCurrent
                          ? "text-lg mb-1 leading-tight"
                          : isCompleted
                            ? "text-sm mb-0.5 leading-tight"
                            : "text-sm leading-tight",
                        isCompleted || isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      )}
                    >
                      {stepDetail.heading}
                    </h3>

                    {/* Description only for current and completed steps */}
                    {(isCurrent || isCompleted) && (
                      <p
                        className={cn(
                          "leading-relaxed transition-colors",
                          isCurrent
                            ? "text-sm text-muted-foreground"
                            : "text-xs text-muted-foreground leading-snug"
                        )}
                      >
                        {stepDetail.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
