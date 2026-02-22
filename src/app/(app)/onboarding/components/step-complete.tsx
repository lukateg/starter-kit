"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "../onboarding-context";

export function StepComplete() {
  const { formData, handleNext, isSubmitting } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          You&apos;re All Set!
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Here&apos;s a quick summary of your project. You can always change these
          settings later.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{formData.projectName}</span>
          </div>
          {formData.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span className="font-medium truncate ml-4 max-w-[200px]">
                {formData.description}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Theme:</span>
            <span className="font-medium capitalize">{formData.theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Notifications:</span>
            <span className="font-medium">
              {formData.enableNotifications ? "Enabled" : "Disabled"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={handleNext}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating project...
          </>
        ) : (
          <>
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
