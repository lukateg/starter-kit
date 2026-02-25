# Ralph Loop — Autonomous Build Runner

> Run Claude Code in a loop to build your entire app from a task list. Each iteration gets fresh context, completes one task with full effort, and marks it done. You see everything — reasoning, file edits, tool calls — in real time. The loop never stops to ask permission.

## When to Use

- You have a PRD and want to build the full app autonomously
- The build is too large for a single Claude Code session (context window limit)
- You want to run it while doing other work — just watch the terminal output

## How It Works

1. You provide a PRD (product spec)
2. Claude breaks it into atomic tasks in `.ralph/TASKS.md`
3. A bash loop runs Claude Code repeatedly
4. Each iteration: reads the task list → picks the first unchecked task → completes it → marks it done
5. **Full output visible** — you see exactly what Claude sees, thinks, and does
6. **No permission prompts** — all tool calls auto-approved so the loop never stalls
7. Fresh context each iteration — no context window overflow, each task gets full attention
8. Loop exits when all tasks are checked off

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ PROMPT.md   │────>│ Claude Code  │────>│ Completes   │
│ + TASKS.md  │     │ (full output)│     │ one task    │
└─────────────┘     └──────────────┘     └──────┬──────┘
      ^                                         │
      │              Marks task done,           │
      └─────────── loops back ─────────────────┘
```

## Setup

### Step 1: Generate Your Task List

Give Claude your PRD and ask it to create the Ralph Loop task breakdown:

```
Here's my PRD: [paste or reference file]

Break this into atomic tasks for the Ralph Loop.
Each task should be completable in one Claude Code context window.
Write them to .ralph/TASKS.md following the template format.
```

Claude will:
- Read your PRD and `DOCS/GUIDE/BUILD_FROM_PRD.md`
- Break the app into 10-20 ordered tasks
- Write them to `.ralph/TASKS.md` with specific file paths, table names, and which DOCS/CORE/ files to read

### Step 2: Review the Task List

Open `.ralph/TASKS.md` and verify:
- Tasks are in the right order (schema before backend, backend before UI)
- Each task is small enough for one session (one page, one backend module, etc.)
- Task descriptions include enough context for a fresh Claude instance

### Step 3: Run the Loop

```bash
# Start Convex dev server in one terminal
npx convex dev

# Run the loop in another terminal
./ralph.sh
```

Options:
```bash
./ralph.sh                      # Default: max 25 iterations, sonnet model
./ralph.sh --max 40             # More iterations for larger apps
./ralph.sh --pause 5            # Longer pause between iterations
./ralph.sh --model opus         # Use opus for higher quality (slower, more expensive)
./ralph.sh --model sonnet       # Use sonnet (default — good balance)
```

Stop anytime with `Ctrl+C`. Run `./ralph.sh` again to continue from where it left off.

## What You See

Each iteration shows full Claude Code output in your terminal:

```
  ┌─────────────────────────────────────
  │ Iteration 3/25 — Task 5/15
  │ **TASK 5: Build the campaign dashboard page**
  │ Started 14:23:05
  └─────────────────────────────────────

  [Claude's full reasoning and actions stream here in real time]
  Reading DOCS/CORE/DESIGN_SYSTEM.md...
  Creating src/app/(app)/projects/[projectId]/campaigns/page.tsx...
  Creating src/app/(app)/projects/[projectId]/campaigns/components/...
  Running npm run typecheck...
  Marking task complete...

  ── Iteration 3 complete ──
  Progress: 5/15 tasks done, 10 remaining
  Ended 14:31:42
```

You can watch the build happen or walk away — it doesn't need you.

## File Structure

```
.ralph/
├── PROMPT.md    # Instructions fed to Claude each iteration (ships with kit)
└── TASKS.md     # Your app's task checklist (generated per project)

ralph.sh         # The bash loop runner (ships with kit)
```

### PROMPT.md (Pre-configured)

Ships with the kit. Points Claude to `CLAUDE.md`, the task list, and enforces all project conventions. You shouldn't need to modify this.

### TASKS.md (You Generate)

This is app-specific. Generated from your PRD. Format:

```markdown
## Phase 1: Schema & Backend

- [ ] **TASK 1: Extend schema with app tables**
  - Add `items` table with fields: projectId, title, status, createdAt
  - File: `convex/schema.ts`

- [ ] **TASK 2: Create items backend**
  - Create `convex/items.ts` with list, create, update, delete
  - Read `DOCS/CORE/ERROR_HANDLING.md` before writing
```

Tasks get checked off as they're completed:
```markdown
- [x] **TASK 1: Extend schema with app tables**
- [x] **TASK 2: Create items backend**
- [ ] **TASK 3: Build items page**  ← next iteration picks this up
```

## Writing Good Tasks

The quality of your task breakdown determines the quality of the output.

**Good task** (self-contained, specific):
```
- [ ] **TASK 5: Build the campaign dashboard page**
  - Create `src/app/(app)/projects/[projectId]/campaigns/`
  - page.tsx — thin page, loads campaigns with useQueryWithStatus
  - components/campaign-list.tsx — table with status badges, click to open
  - components/campaign-stats.tsx — summary cards (found, sent, replied, won)
  - Read `DOCS/CORE/DESIGN_SYSTEM.md` before building
  - Read `DOCS/CORE/ERROR_HANDLING.md` for QueryState pattern
```

**Bad task** (too vague, too large):
```
- [ ] **TASK 5: Build all the app pages**
```

### Rules for Task Breakdown

1. **One concern per task** — one backend module OR one page OR one integration
2. **Schema first** — always extend the schema before writing queries/mutations
3. **Backend before frontend** — queries/mutations before pages that use them
4. **Include file paths** — tell Claude exactly where to create files
5. **Reference DOCS/CORE/ files** — so each fresh instance reads the right conventions
6. **15-20 tasks typical** — for a standard MVP

## Monitoring Progress

The loop shows progress after each iteration. You can also check anytime:
```bash
# See which tasks are done
grep -c '\- \[x\]' .ralph/TASKS.md    # completed
grep -c '\- \[ \]' .ralph/TASKS.md    # remaining
```

Or just open `.ralph/TASKS.md` in your editor.

## Stuck Detection

The loop detects when an iteration doesn't complete any task and warns you:

```
  ⚠ No task was completed this iteration.
  This may mean the task is too large or Claude got stuck.
  Consider splitting the task or fixing issues manually.
```

The loop continues automatically — sometimes the next iteration fixes the issue. If the same task gets stuck repeatedly, stop the loop and either split the task or fix the blocker manually.

## Troubleshooting

**Loop exits early / Claude doesn't finish a task**: Increase `--max-turns` by editing `ralph.sh` (default 100). Some complex tasks need more turns.

**TypeScript errors accumulate**: The loop runs `npm run typecheck` after frontend tasks. If errors persist across iterations, stop the loop, fix manually, and restart.

**Task too large for one session**: Stop the loop, split the task into smaller subtasks in TASKS.md, and restart.

**Want to skip a task**: Manually check it off (`- [x]`) in TASKS.md before running the loop.

**Want to re-run a task**: Uncheck it (`- [ ]`) and restart the loop.

**Using a different model**: Pass `--model opus` for higher quality on complex tasks, or `--model sonnet` (default) for the best speed/quality balance.
