"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../onboarding-context";

export function StepPreferences() {
  const { formData, updateFormData } = useOnboarding();

  return (
    <>
      {/* TODO: Replace these with your app-specific preferences */}
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={formData.theme}
          onValueChange={(v) => updateFormData("theme", v)}
        >
          <SelectTrigger id="theme">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System Default</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose how the app looks. You can change this anytime in settings.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <Label htmlFor="enableNotifications">Email Notifications</Label>
          <p className="text-xs text-muted-foreground">
            Receive updates and important alerts via email.
          </p>
        </div>
        <Switch
          id="enableNotifications"
          checked={formData.enableNotifications}
          onCheckedChange={(v) => updateFormData("enableNotifications", v)}
        />
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          These are placeholder preferences. Replace them with options relevant to your app
          (e.g., default language, notification frequency, feature toggles).
        </p>
      </div>
    </>
  );
}
