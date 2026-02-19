# Onboarding

> **Status**: Shell ready
> **Last Updated**: 2026-02-17

## Overview

The onboarding is a multi-step wizard that collects the minimum data needed for users to start using the app. The framework is pre-built — you customize the steps for your specific app.

## Architecture

```
src/app/(app)/onboarding/
├── page.tsx                    # Main onboarding page
├── onboarding-context.tsx      # Step state management
└── components/
    ├── onboarding-sidebar.tsx  # Progress sidebar (desktop)
    ├── onboarding-mobile-header.tsx  # Progress header (mobile)
    └── step-*.tsx              # Individual step components
```

## Key Design Principle

**Collect the MINIMUM data needed for the user to start using the app.**

Don't over-collect. Every step should map to a real schema field or user preference that's needed for the first experience. If you can defer it to settings, do that instead.

Good onboarding: 3-5 steps, each with a clear purpose.
Bad onboarding: 10 steps collecting "nice to have" data.

## How It Works

### Layout
The onboarding page renders **without the app sidebar/header**. This is handled in `(app)/layout.tsx` which checks the current path and conditionally hides the sidebar for `/onboarding`.

### State Management
`onboarding-context.tsx` manages:
- Current step index
- Form data collected across steps
- Navigation (next, back, skip)
- Completion status

### Step Components
Each step is a separate component that:
- Receives form data and update functions from context
- Renders its own UI (form fields, selections, etc.)
- Validates its own fields before allowing next step

### Completion
After the final step:
1. Data is saved to Convex (project creation, user preferences, etc.)
2. `hasCompletedOnboarding` is set to `true` on the user
3. User is redirected to their first project page

## Customizing for Your App

### Step 1: Identify Minimum Data
Read your PRD and ask: "What does the user need to provide before they can use the app?"

Examples:
- Project name and description
- Business type or category
- Target audience
- First entity creation (e.g., first workspace, first campaign)

### Step 2: Create Step Components

```typescript
// src/app/(app)/onboarding/components/step-project-basics.tsx
"use client";

interface StepProjectBasicsProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export function StepProjectBasics({ data, updateData }: StepProjectBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Name your project</h2>
        <p className="text-muted-foreground mt-1">
          This helps organize your work
        </p>
      </div>
      <Input
        value={data.projectName}
        onChange={(e) => updateData({ projectName: e.target.value })}
        placeholder="My Project"
      />
    </div>
  );
}
```

### Step 3: Register Steps in Context

Update the steps array in `onboarding-context.tsx`:

```typescript
const STEPS = [
  { id: "project-basics", title: "Project Setup", component: StepProjectBasics },
  { id: "preferences", title: "Preferences", component: StepPreferences },
  { id: "review", title: "Review", component: StepReview },
];
```

## UX Patterns

- **Progress indicator**: Sidebar (desktop) / header (mobile) shows completed and remaining steps
- **Back navigation**: Users can go back to previous steps
- **Skip optional steps**: Some steps can be marked as skippable
- **Validation before next**: Each step validates its inputs before allowing progression
- **Immediate value**: After onboarding, the user should immediately see something useful (not an empty dashboard)
