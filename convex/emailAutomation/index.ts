/**
 * Email Automation Module
 *
 * Data-driven email sequences for user lifecycle emails.
 *
 * Architecture:
 * - config.ts:     Sequence definitions (add new sequences here)
 * - triggers.ts:   Entry points that enroll users into sequences
 * - queries.ts:    Queries that check enrollment and progress
 * - sequences.ts:  Cron processor that sends follow-up emails
 *
 * Adding a new sequence:
 * 1. Define it in config.ts (id, steps, delays)
 * 2. Add a trigger in triggers.ts (called from your business logic)
 * 3. Add the email template/action in emails.ts
 * 4. The cron processor handles the rest automatically
 */

export { SEQUENCES, resolveSubject, getSequenceById, getNextStep } from "./config";
export type { SequenceId, SequenceDefinition, EmailStep } from "./config";
