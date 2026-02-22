#!/bin/bash

# ============================================
# Ralph Loop — Autonomous AI Build Runner
# ============================================
# Runs Claude Code in a loop, completing one task per iteration
# from .ralph/TASKS.md until all tasks are done.
#
# Usage:
#   ./ralph.sh                    # Default: max 25 iterations
#   ./ralph.sh --max 40           # Custom iteration limit
#   ./ralph.sh --pause 5          # Custom pause between iterations (seconds)
#
# Prerequisites:
#   - Claude Code CLI installed and authenticated
#   - .ralph/PROMPT.md configured for your app
#   - .ralph/TASKS.md with your task checklist
#
# Stop: Ctrl+C at any time
# ============================================

MAX_ITERATIONS=25
PAUSE_SECONDS=3

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --max) MAX_ITERATIONS="$2"; shift ;;
    --pause) PAUSE_SECONDS="$2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

# Verify required files exist
if [ ! -f ".ralph/PROMPT.md" ]; then
  echo "Error: .ralph/PROMPT.md not found."
  echo "Run this from your project root. See DOCS/GUIDE/RALPH_LOOP.md for setup."
  exit 1
fi

if [ ! -f ".ralph/TASKS.md" ]; then
  echo "Error: .ralph/TASKS.md not found."
  echo "Generate your task list first. See DOCS/GUIDE/RALPH_LOOP.md for setup."
  exit 1
fi

# Count total and remaining tasks
count_remaining() {
  grep -c '^\- \[ \]' .ralph/TASKS.md 2>/dev/null || echo 0
}

count_completed() {
  grep -c '^\- \[x\]' .ralph/TASKS.md 2>/dev/null || echo 0
}

TOTAL_TASKS=$(($(count_remaining) + $(count_completed)))
ITERATION=0

echo ""
echo "  Ralph Loop"
echo "  Tasks: $(count_remaining) remaining / $TOTAL_TASKS total"
echo "  Max iterations: $MAX_ITERATIONS"
echo "  Pause: ${PAUSE_SECONDS}s between iterations"
echo "  Stop: Ctrl+C"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  REMAINING=$(count_remaining)

  # Check if all tasks are done before starting
  if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo "  All $TOTAL_TASKS tasks complete after $ITERATION iterations."
    echo "  Finished at $(date '+%H:%M:%S')"
    exit 0
  fi

  ITERATION=$((ITERATION + 1))
  COMPLETED=$(count_completed)

  echo "[$ITERATION/$MAX_ITERATIONS] Task $((COMPLETED + 1))/$TOTAL_TASKS — $(date '+%H:%M:%S')"

  # Run Claude Code with the prompt
  OUTPUT=$(cat .ralph/PROMPT.md | claude --max-turns 100 --print 2>&1)

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "ALL TASKS COMPLETE"; then
    echo ""
    echo "  All tasks complete after $ITERATION iterations."
    echo "  Finished at $(date '+%H:%M:%S')"
    exit 0
  fi

  # Brief pause between iterations
  sleep "$PAUSE_SECONDS"
done

echo ""
echo "  Reached max iterations ($MAX_ITERATIONS)."
echo "  Progress: $(count_completed)/$TOTAL_TASKS tasks complete."
echo "  Run ./ralph.sh again to continue."
