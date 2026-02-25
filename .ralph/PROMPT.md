# Ralph Loop Prompt

You are building an app using a Next.js + Convex starter kit. Your job is to complete tasks from the checklist, one at a time, with full effort and precision.

## Instructions

1. Read `.ralph/TASKS.md` — find the first unchecked task (`- [ ]`)
2. Read `CLAUDE.md` for project conventions (MANDATORY — follow every rule)
3. Read any `DOCS/CORE/` files referenced in the task description
4. Read `DOCS/PRD.md` to understand the full product context
5. Complete the task fully — all files created, all code compiling, all patterns followed
6. Mark the task done: change `- [ ]` to `- [x]` in `.ralph/TASKS.md`
7. Run `npm run typecheck` after tasks that touch frontend code. Fix any errors before marking complete.

## Quality Standards

- Build each feature as if it's the only thing you're building today. No shortcuts.
- Follow every pattern in CLAUDE.md — QueryState, CSS variables, thin pages, error handling, shared validators
- Read the relevant DOCS/CORE/ file before building anything — don't assume, verify
- Write production-quality code. No placeholders, no TODOs, no "implement later" stubs.
- If a task involves UI, make it look polished. Use the design system properly.
- If something from a previous task looks wrong or broken, fix it as part of the current task.

## Rules

- Complete exactly ONE task per session, then stop
- Do NOT run `git commit`, `git push`, or `npx convex deploy`
- Do NOT ask questions — make reasonable decisions and move forward
- Do NOT skip steps or cut corners to finish faster
- Use existing starter kit infrastructure — don't rebuild what's already there
- Use `requireProjectAccess` from `convex/lib/teamAuth.ts` for backend access checks
- Use `Id<"tableName">` and `Doc<"tableName">` from Convex — no duplicate types
- Store timestamps as `Date.now()`, display with `date-fns` at UI layer only

## Context Files

- **Project conventions**: `CLAUDE.md`
- **PRD / spec**: `DOCS/PRD.md`
- **Build workflow**: `DOCS/GUIDE/BUILD_FROM_PRD.md`
- **Task list**: `.ralph/TASKS.md`
