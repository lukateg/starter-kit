# Forms & Validation

> **Status**: Active
> **Last Updated**: 2026-02-17

## Overview

All forms use **React Hook Form** with **Zod** validation. Shared validators live in `convex/utils/validators.ts` so the same schemas work in both frontend forms and backend mutations.

## Stack

| Library | Purpose |
|---------|---------|
| `react-hook-form` | Form state, submission, field registration |
| `@hookform/resolvers` | Connects Zod schemas to React Hook Form |
| `zod` | Schema validation (shared between frontend + backend) |

## Basic Form Pattern

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: FormValues) {
    await myMutation({ ...values });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save
        </Button>
      </form>
    </Form>
  );
}
```

## Shared Validators (`convex/utils/validators.ts`)

Define Zod schemas once, import everywhere:

```typescript
// convex/utils/validators.ts
import { z } from "zod";

export const projectName = z.string().min(1, "Required").max(100).trim();
export const email = z.string().email("Invalid email");
export const username = z.string().min(3).max(32).toLowerCase().trim()
  .regex(/^[a-zA-Z0-9]+$/, "Alphanumeric characters only");
```

**In frontend forms:**
```typescript
import { projectName, email } from "@/../../convex/utils/validators";

const formSchema = z.object({
  name: projectName,
  email: email,
});
```

**In backend mutations:**
```typescript
import { projectName } from "./utils/validators";

export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const validated = projectName.safeParse(args.name);
    if (!validated.success) throwValidationError(validated.error.message);
    // ...
  },
});
```

## Error Display Rules

Errors must NEVER cause layout shifts. Follow these patterns:

### Action Errors (API failures, mutation errors)
Show in a **toast** (sonner):
```typescript
import { toast } from "sonner";

try {
  await myMutation({ ... });
  toast.success("Saved successfully");
} catch {
  toast.error("Something went wrong. Please try again.");
}
```

### Input Validation Errors
Show via **tooltip on AlertTriangle icon** inside the input (absolute positioned, no layout shift):
```typescript
<div className="relative">
  <Input {...field} />
  {error && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-danger" />
        </TooltipTrigger>
        <TooltipContent><p>{error}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )}
</div>
```

### Page-Level Errors
Handled by `QueryState` component. See `DOCS/CORE/ERROR_HANDLING.md`.

## Conventions

- Always use the shadcn `Form` wrapper components (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
- Default values should match the schema shape
- Disable submit button during `form.formState.isSubmitting`
- Never expose internal error messages to users — show generic messages for API errors
- Use `z.optional()` for non-required fields, not empty string defaults
