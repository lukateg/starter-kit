#!/bin/bash

# ============================================
# Ralph Loop — Autonomous AI Build Runner
# ============================================
# Runs Claude Code in a loop, completing one task per iteration
# from .ralph/TASKS.md until all tasks are done.
#
# You see FULL Claude Code output — reasoning, file edits, tool
# calls — exactly like a normal interactive session. The only
# difference: permission prompts are auto-approved so the loop
# never stalls waiting for you.
#
# Usage:
#   ./ralph.sh                    # Default: max 25 iterations
#   ./ralph.sh --max 40           # Custom iteration limit
#   ./ralph.sh --pause 5          # Custom pause between iterations (seconds)
#   ./ralph.sh --model sonnet     # Use a specific model (default: sonnet)
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
MODEL="sonnet"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --max) MAX_ITERATIONS="$2"; shift ;;
    --pause) PAUSE_SECONDS="$2"; shift ;;
    --model) MODEL="$2"; shift ;;
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
  local n
  n=$(grep -c '^\- \[ \]' .ralph/TASKS.md 2>/dev/null) || true
  echo "${n:-0}"
}

count_completed() {
  local n
  n=$(grep -c '^\- \[x\]' .ralph/TASKS.md 2>/dev/null) || true
  echo "${n:-0}"
}

TOTAL_TASKS=$(($(count_remaining) + $(count_completed)))
ITERATION=0

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║          Ralph Loop                  ║"
echo "  ╠══════════════════════════════════════╣"
echo "  ║  Tasks:  $(printf '%-3s' "$(count_remaining)") remaining / $(printf '%-3s' "$TOTAL_TASKS") total    ║"
echo "  ║  Model:  $(printf '%-27s' "$MODEL")║"
echo "  ║  Max:    $(printf '%-3s' "$MAX_ITERATIONS") iterations              ║"
echo "  ║  Pause:  $(printf '%-3s' "$PAUSE_SECONDS")s between iterations      ║"
echo "  ║  Stop:   Ctrl+C                     ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  REMAINING=$(count_remaining)

  # Check if all tasks are done before starting
  if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo "  ✓ All $TOTAL_TASKS tasks complete after $ITERATION iterations."
    echo "  Finished at $(date '+%H:%M:%S')"
    exit 0
  fi

  ITERATION=$((ITERATION + 1))
  COMPLETED=$(count_completed)
  NEXT_TASK=$(grep -m 1 '^\- \[ \]' .ralph/TASKS.md | sed 's/^- \[ \] //')

  echo ""
  echo "  ┌─────────────────────────────────────"
  echo "  │ Iteration $ITERATION/$MAX_ITERATIONS — Task $((COMPLETED + 1))/$TOTAL_TASKS"
  echo "  │ $NEXT_TASK"
  echo "  │ Started $(date '+%H:%M:%S')"
  echo "  └─────────────────────────────────────"
  echo ""

  # Read prompt and pass as argument (not stdin, so terminal stays interactive)
  PROMPT=$(cat .ralph/PROMPT.md)

  # Run Claude Code with full interactive output visible
  # --dangerously-skip-permissions: auto-approves all tool calls (no stalling)
  # --max-turns 100: generous limit per task
  # --model: configurable model selection
  # No --print flag: you see everything Claude does in real time
  claude \
    --dangerously-skip-permissions \
    --max-turns 100 \
    --model "$MODEL" \
    -p "$PROMPT"

  EXIT_CODE=$?

  COMPLETED_NOW=$(count_completed)
  REMAINING_NOW=$(count_remaining)

  echo ""
  echo "  ── Iteration $ITERATION complete ──"
  echo "  Progress: $COMPLETED_NOW/$TOTAL_TASKS tasks done, $REMAINING_NOW remaining"
  echo "  Ended $(date '+%H:%M:%S')"

  # Check if all tasks are done
  if [ "$REMAINING_NOW" -eq 0 ]; then
    echo ""
    echo "  ✓ All $TOTAL_TASKS tasks complete after $ITERATION iterations."
    echo "  Finished at $(date '+%H:%M:%S')"
    exit 0
  fi

  # Check if Claude exited with an error
  if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "  ⚠ Claude exited with code $EXIT_CODE"
    echo "  Check the output above for errors."
    echo "  The loop will continue with the next iteration."
  fi

  # Check if the task actually got checked off (detect stuck iterations)
  if [ "$COMPLETED_NOW" -eq "$COMPLETED" ]; then
    echo ""
    echo "  ⚠ No task was completed this iteration."
    echo "  This may mean the task is too large or Claude got stuck."
    echo "  Consider splitting the task or fixing issues manually."
    echo "  Continuing in ${PAUSE_SECONDS}s..."
  fi

  # Brief pause between iterations
  sleep "$PAUSE_SECONDS"
done

echo ""
echo "  Reached max iterations ($MAX_ITERATIONS)."
echo "  Progress: $(count_completed)/$TOTAL_TASKS tasks complete."
echo "  Run ./ralph.sh again to continue."
