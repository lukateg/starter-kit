# Ralph Loop — Autonomous Build Runner

> Run Claude Code in a loop to build your entire app from a task list. Each iteration gets fresh context, completes one task, and marks it done. You come back to a built app.

## When to Use

- You have a PRD and want to build the full app autonomously
- The build is too large for a single Claude Code session (context window limit)
- You want to run it overnight or while doing other work

## How It Works

1. You provide a PRD (product spec)
2. Claude breaks it into atomic tasks in `.ralph/TASKS.md`
3. A bash loop runs Claude Code repeatedly
4. Each iteration: reads the task list → picks the first unchecked task → completes it → marks it done
5. Fresh context each iteration — no context window overflow
6. Loop exits when all tasks are checked off

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ PROMPT.md   │────>│ Claude Code  │────>│ Completes   │
│ + TASKS.md  │     │ (fresh ctx)  │     │ one task    │
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
./ralph.sh                  # Default: max 25 iterations
./ralph.sh --max 40         # More iterations for larger apps
./ralph.sh --pause 5        # Longer pause between iterations
```

Stop anytime with `Ctrl+C`. Run `./ralph.sh` again to continue from where it left off.

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
- [ ] **TASK 5: Build the repurpose page**
  - Create `src/app/(app)/projects/[projectId]/flows/[flowId]/`
  - page.tsx — thin page, loads flow data with useQueryWithStatus
  - components/repurpose-content.tsx — textarea + generate button
  - On submit: call generateContent action, redirect to results page
  - Read `DOCS/CORE/DESIGN_SYSTEM.md` before building
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

Check progress anytime:
```bash
# See which tasks are done
grep -c '\- \[x\]' .ralph/TASKS.md    # completed
grep -c '\- \[ \]' .ralph/TASKS.md    # remaining
```

Or just open `.ralph/TASKS.md` in your editor.

## Troubleshooting

**Loop exits early / Claude doesn't finish a task**: Increase `--max-turns` in `ralph.sh` (default 100). Some complex tasks need more turns.

**TypeScript errors accumulate**: The loop runs `npm run typecheck` after frontend tasks. If errors persist across iterations, stop the loop, fix manually, and restart.

**Task too large for one session**: Stop the loop, split the task into smaller subtasks in TASKS.md, and restart.

**Want to skip a task**: Manually check it off (`- [x]`) in TASKS.md before running the loop.

**Want to re-run a task**: Uncheck it (`- [ ]`) and restart the loop.
