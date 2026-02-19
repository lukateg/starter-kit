"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOnboarding } from "../onboarding-context";

export function StepProjectBasics() {
  const { formData, updateFormData } = useOnboarding();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name *</Label>
        <Input
          id="projectName"
          value={formData.projectName}
          onChange={(e) => updateFormData("projectName", e.target.value)}
          placeholder="My Awesome Project"
          required
        />
        <p className="text-xs text-muted-foreground">
          Choose a name that helps you identify this project.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Briefly describe what this project is about..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/500 characters (optional)
        </p>
      </div>
    </>
  );
}
