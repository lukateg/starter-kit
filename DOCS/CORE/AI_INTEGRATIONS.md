# AI Integrations

> **Status**: Infrastructure ready, no demo features
> **Last Updated**: 2026-02-17

## Overview

The starter kit ships with AI SDKs installed and documented patterns for building AI features. **No demo chat or AI feature ships by default** — just the infrastructure and this documentation. AI builds whatever the specific app needs.

## Installed SDKs

| Package | Purpose |
|---------|---------|
| `ai` | Vercel AI SDK — streaming, `useChat`, `useCompletion`, structured output |
| `@ai-sdk/react` | React hooks for AI SDK (`useChat`, `useCompletion`) |
| `@ai-sdk/google` | Google Gemini provider |
| `@anthropic-ai/sdk` | Anthropic Claude SDK (direct) |
| `openai` | OpenAI SDK (direct) |

## Architecture Pattern

```
Frontend (React)          Convex HTTP Action           AI Provider
─────────────────       ──────────────────────       ─────────────
useChat() hook    →     HTTP action ("use node")  →  AI API call
streaming UI      ←     toDataStreamResponse()    ←  streaming response
```

### Why Convex Actions?

AI calls require HTTP requests, which are only allowed in Convex **actions** (not queries/mutations). Actions use the `"use node"` directive to run in Node.js runtime.

## Patterns

### 1. Streaming Chat (Vercel AI SDK + Convex HTTP Action)

**Backend** (`convex/http.ts` or a dedicated file):
```typescript
import { httpAction } from "./_generated/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const aiChat = httpAction(async (ctx, request) => {
  // Verify auth
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return new Response("Unauthorized", { status: 401 });

  const { messages } = await request.json();

  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
  });

  return result.toDataStreamResponse();
});
```

**Frontend**:
```typescript
"use client";
import { useChat } from "@ai-sdk/react";

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `${process.env.NEXT_PUBLIC_CONVEX_URL}/ai-chat`, // Your HTTP action URL
  });

  return (
    <div>
      {messages.map((m) => <div key={m.id}>{m.content}</div>)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

### 2. Structured Output (Schema-Validated Responses)

Use Zod schemas to get typed, validated responses from AI:

```typescript
import { generateObject } from "ai";
import { z } from "zod";

const result = await generateObject({
  model: google("gemini-2.0-flash"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    sentiment: z.enum(["positive", "negative", "neutral"]),
  }),
  prompt: "Analyze this customer feedback: ...",
});

// result.object is fully typed
const { title, summary, tags, sentiment } = result.object;
```

### 3. Direct Provider Usage (Non-Streaming)

For simple, non-streaming calls where you don't need the AI SDK abstractions:

```typescript
// Using Anthropic directly
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "..." }],
});
```

### 4. Google Search Grounding

Gemini supports grounding responses with real-time web search:

```typescript
const result = await generateText({
  model: google("gemini-2.0-flash"),
  prompt: "What are the latest trends in...",
  tools: { googleSearch: google.tools.googleSearch() },
});
```

## Model Selection Guide

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| Fast, cheap tasks | `gemini-2.0-flash` | Lowest cost, fast |
| Complex reasoning | `claude-sonnet-4-20250514` | Best reasoning |
| Code generation | `gpt-4o` or `claude-sonnet-4-20250514` | Good at code |
| Structured output | `gemini-2.0-flash` | Reliable JSON mode |
| With web search | `gemini-2.0-flash` | Native grounding |

## Environment Variables

```bash
# In Convex dashboard (for backend actions):
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Note: @ai-sdk/google looks for GOOGLE_GENERATIVE_AI_API_KEY by default.
# We use GEMINI_API_KEY and pass it explicitly to createGoogleGenerativeAI().
```

## Credit Deduction Pattern

If your app charges credits for AI features:

```typescript
// In your Convex action:
// 1. Check credits BEFORE calling AI
const user = await ctx.runQuery(internal.users.getByClerkId, { clerkId });
if (user.credits < CREDIT_COSTS.YOUR_AI_ACTION) {
  throw new Error("Insufficient credits");
}

// 2. Call AI
const result = await generateText({ ... });

// 3. Deduct credits AFTER success
await ctx.runMutation(internal.users.deductCredits, {
  userId: user._id,
  amount: CREDIT_COSTS.YOUR_AI_ACTION,
  description: "AI feature usage",
});
```

## Important Notes

- **Always use actions** (`"use node"`) for AI calls — queries/mutations can't make HTTP requests
- **Pass API keys explicitly** when using providers in Convex actions (env var names may differ)
- **Handle rate limits** — AI providers have rate limits. Implement retry with exponential backoff for production use.
- **No AI demo ships** — Build the AI features your specific app needs using these patterns
