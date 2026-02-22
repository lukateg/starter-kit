# Ralph Loop Prompt

You are building an app using a Next.js + Convex starter kit. Your job is to complete tasks from the checklist, one at a time.

## Instructions

1. Read `.ralph/TASKS.md` — find the first unchecked task (`- [ ]`)
2. Read `CLAUDE.md` for project conventions (MANDATORY — follow every rule)
3. Read any `DOCS/CORE/` files referenced in the task description
4. Complete the task fully — all files created, all code compiling
5. Mark the task done: change `- [ ]` to `- [x]` in `.ralph/TASKS.md`
6. Run `npm run typecheck` after tasks that touch frontend code. Fix any errors before marking complete.
7. If ALL tasks in `.ralph/TASKS.md` are checked off, output exactly: `ALL TASKS COMPLETE`

## Rules

- Complete exactly ONE task per session, then stop
- Follow `CLAUDE.md` conventions exactly — QueryState pattern, CSS variables, thin pages, error handling
- Read the relevant `DOCS/CORE/` file before building anything (design system, error handling, AI, forms, etc.)
- Use existing starter kit infrastructure — don't rebuild what's already there
- Use `requireProjectAccess` from `convex/lib/teamAuth.ts` for backend access checks
- Use `Id<"tableName">` and `Doc<"tableName">` from Convex — no duplicate types
- Store timestamps as `Date.now()`, display with `date-fns` at UI layer only
- Do NOT run `git commit`, `git push`, or `npx convex deploy`

## Context Files

- **Project conventions**: `CLAUDE.md`
- **PRD / spec**: Check `DOCS/GUIDE/` for the product requirements document
- **Build workflow**: `DOCS/GUIDE/BUILD_FROM_PRD.md`
- **Task list**: `.ralph/TASKS.md`
