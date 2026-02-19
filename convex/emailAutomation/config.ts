/**
 * Email Automation Configuration
 *
 * Data-driven sequence definitions. Add new sequences here without
 * touching the processor or trigger logic.
 */

// ============================================
// Sequence Step
// ============================================

export interface EmailStep {
  stepNumber: number;
  emailType: string;
  delayDays: number;
  subject: string;
}

// ============================================
// Sequence Definition
// ============================================

export interface SequenceDefinition {
  id: string;
  name: string;
  steps: EmailStep[];
}

// ============================================
// Sequences
// ============================================

export const SEQUENCES = {
  WELCOME: {
    id: "welcome",
    name: "Welcome Sequence",
    steps: [
      {
        stepNumber: 0,
        emailType: "welcome_day_0",
        delayDays: 0,
        subject: "Welcome to {appName}!",
      },
      {
        stepNumber: 1,
        emailType: "welcome_day_2",
        delayDays: 2,
        subject: "Quick tips to get started",
      },
      {
        stepNumber: 2,
        emailType: "welcome_day_5",
        delayDays: 5,
        subject: "How's it going?",
      },
    ],
  },
} as const satisfies Record<string, SequenceDefinition>;

export type SequenceId = (typeof SEQUENCES)[keyof typeof SEQUENCES]["id"];

// ============================================
// Helpers
// ============================================

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "our app";

/**
 * Replace `{appName}` placeholder in a subject line.
 */
export function resolveSubject(raw: string): string {
  return raw.replace(/\{appName\}/g, APP_NAME);
}

/**
 * Look up a sequence definition by its string id.
 */
export function getSequenceById(id: string): SequenceDefinition | undefined {
  return Object.values(SEQUENCES).find((s) => s.id === id);
}

/**
 * Get the next step after the given step number, or undefined if the
 * sequence is complete.
 */
export function getNextStep(
  sequence: SequenceDefinition,
  currentStepNumber: number
): EmailStep | undefined {
  return sequence.steps.find((s) => s.stepNumber === currentStepNumber + 1);
}
