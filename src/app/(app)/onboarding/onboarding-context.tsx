"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../../convex/_generated/api";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";

// Step names for analytics
export const STEP_NAMES = [
  "Create Project",
  "Preferences",
  "Complete",
];

export const TOTAL_STEPS = 3;

export interface StepDetail {
  number: number;
  label: string;
  heading: string;
  description: string;
}

export const stepDetails: StepDetail[] = [
  {
    number: 1,
    label: "Create Project",
    heading: "Create Your Project",
    description: "Give your project a name and describe what it's about.",
  },
  {
    number: 2,
    label: "Preferences",
    heading: "Set Your Preferences",
    description: "Configure a few options to personalize your experience.",
  },
  {
    number: 3,
    label: "Complete",
    heading: "You're All Set!",
    description: "Review your setup and get started.",
  },
];

interface OnboardingContextValue {
  // Navigation
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => Promise<void>;
  handleBack: () => void;

  // Form data
  formData: {
    projectName: string;
    description: string;
    // TODO: Add your app-specific preferences here
    enableNotifications: boolean;
    theme: string;
  };
  updateFormData: (
    field: string,
    value: string | boolean | number
  ) => void;

  // Status flags
  isSubmitting: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  // Projects
  hasProjects: boolean;
  projects: Array<{ _id: string }> | undefined;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const markOnboardingCompleted = useMutation(api.users.markOnboardingCompleted);

  const projectsQuery = useQueryWithStatus(api.projects.list);
  const projects = projectsQuery.data;
  const hasProjects = !!(projects && projects.length > 0);
  const posthog = usePostHog();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    // TODO: Add your app-specific preferences here
    enableNotifications: true,
    theme: "system",
  });

  // Skip intro splash for returning users
  useEffect(() => {
    if (hasProjects && step === 0) {
      setStep(1);
    }
  }, [hasProjects, step]);

  // Track step views
  useEffect(() => {
    if (posthog && step >= 1 && step <= TOTAL_STEPS) {
      posthog.capture("onboarding_step_viewed", {
        step_number: step,
        step_name: STEP_NAMES[step - 1],
        total_steps: TOTAL_STEPS,
      });
    }
  }, [step, posthog]);

  // Track dropoff
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (posthog && step < TOTAL_STEPS) {
        posthog.capture("onboarding_dropoff", {
          step_number: step,
          step_name: STEP_NAMES[step - 1],
          total_steps: TOTAL_STEPS,
          completion_percentage: (step / TOTAL_STEPS) * 100,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, posthog]);

  const updateFormData = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    setError(null);

    const trackValidationError = (errorMessage: string) => {
      if (posthog) {
        posthog.capture("onboarding_validation_error", {
          step_number: step,
          step_name: STEP_NAMES[step - 1],
          error_message: errorMessage,
        });
      }
    };

    if (step === 1) {
      if (!formData.projectName || formData.projectName.length < 3) {
        const err = "Project name must be at least 3 characters";
        setError(err);
        trackValidationError(err);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      if (!validateStep()) return;

      if (posthog) {
        posthog.capture("onboarding_step_completed", {
          step_number: step,
          step_name: STEP_NAMES[step - 1],
          next_step: STEP_NAMES[step],
          total_steps: TOTAL_STEPS,
        });
      }

      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final step - create the project
      if (!validateStep()) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const projectId = await createProject({
          name: formData.projectName,
          description: formData.description || undefined,
          // TODO: Pass your app-specific preferences to the mutation
        });

        try {
          await markOnboardingCompleted();
        } catch (onboardingError) {
          console.error("Error marking onboarding as completed:", onboardingError);
        }

        if (posthog) {
          posthog.capture("onboarding_completed", {
            total_steps: TOTAL_STEPS,
          });
          posthog.setPersonProperties({
            onboarding_completed: true,
            has_project: true,
          });
        }

        toast.success("Project created! Let's get started.");
        setIsSubmitting(false);
        router.push(`/projects/${projectId}/dashboard`);
      } catch (err) {
        console.error("Error creating project:", err);
        if (posthog) {
          posthog.capture("onboarding_failed", {
            step_number: step,
            step_name: STEP_NAMES[step - 1],
            error_message: err instanceof Error ? err.message : "Unknown error",
          });
        }
        setError("Something went wrong while creating your project. Please try again. If the problem persists, contact support.");
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (posthog) {
        posthog.capture("onboarding_step_back", {
          from_step: step,
          from_step_name: STEP_NAMES[step - 1],
          to_step: step - 1,
          to_step_name: STEP_NAMES[step - 2],
        });
      }
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const value: OnboardingContextValue = {
    step, setStep, handleNext, handleBack,
    formData, updateFormData,
    isSubmitting, error, setError,
    hasProjects, projects: projects as Array<{ _id: string }> | undefined,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
