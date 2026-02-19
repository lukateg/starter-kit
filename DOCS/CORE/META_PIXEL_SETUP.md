# Meta Pixel Tracking Implementation

## Overview

This document describes the Meta Pixel tracking implementation, covering Lead and Purchase events.

## Architecture

### Lead Events (Server-Side Only)
- **Trigger**: When a new user signs up (Clerk `user.created` webhook)
- **Location**: [convex/http.ts:60-72](convex/http.ts#L60-L72)
- **Action**: [convex/webhookActions.ts:143-175](convex/webhookActions.ts#L143-L175)
- **Why server-side only**: Prevents duplicate tracking on every sign-in, only tracks first signup
- **Reliability**: Can't be blocked by ad blockers

### Purchase Events (Dual Tracking with Deduplication)
- **Client-Side Trigger**: When user returns to billing page with `?success=true`
- **Server-Side Trigger**: When LemonSqueezy webhook receives `order_created` event
- **Deduplication**: Both use same `event_id` to prevent duplicate counting
- **Client Location**: [src/app/(app)/settings/billing/page.tsx](src/app/(app)/settings/billing/page.tsx)
- **Server Location**: [convex/webhookActions.ts:291-393](convex/webhookActions.ts#L291-L393)
- **Reliability**: If one method fails, the other provides backup

## Event Flow

### Lead Event Flow
```
User Signs Up
    ↓
Clerk Webhook (user.created)
    ↓
convex/http.ts: handleClerkWebhook
    ↓
convex/webhookActions.ts: trackMetaLeadEvent
    ↓
Meta Conversion API
```

### Purchase Event Flow
```
User Clicks "Purchase"
    ↓
Generate event_id on client
    ↓
POST /api/lemonsqueezy/checkout (with event_id)
    ↓
LemonSqueezy Checkout (event_id in custom data)
    ↓
                    ┌─────────────────┬─────────────────┐
                    ↓                 ↓                 ↓
         User Returns to     LemonSqueezy        [Event ID stored
         Success Page        Webhook             in transaction
                    ↓         (order_created)     metadata]
                    ↓                 ↓                 ↓
         Retrieve event_id   Extract event_id    Retrieved by
         from transaction    from custom data    client for tracking
         metadata                    ↓
                    ↓                 ↓
         Client-side Meta    Server-side Meta
         Pixel tracking      Conversion API
                    ↓                 ↓
                    └─────────────────┘
                            ↓
                Meta Deduplicates Using event_id
                (Counts event only once)
```

## Required Environment Variables

### Convex Environment (Backend)
```bash
# Required for Meta Conversion API
npx convex env set NEXT_PUBLIC_META_PIXEL_ID "your_pixel_id_here"
npx convex env set META_CONVERSION_API_ACCESS_TOKEN "your_access_token_here"
npx convex env set META_API_VERSION "v22.0"
npx convex env set NEXT_PUBLIC_APP_URL "https://yourdomain.com"

# Already configured (required for webhooks)
npx convex env set CLERK_WEBHOOK_SECRET "your_clerk_secret"
npx convex env set LEMONSQUEEZY_WEBHOOK_SECRET "your_lemonsqueezy_secret"
```

### Next.js Environment (.env.local)
```bash
# Required for client-side Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID="your_pixel_id_here"

# Required for LemonSqueezy API
LEMONSQUEEZY_API_KEY="your_api_key"
LEMONSQUEEZY_STORE_ID="your_store_id"

# App URL for checkout redirects
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Meta Conversion API Integration

### PII Hashing
All personally identifiable information (PII) is hashed with SHA-256 before sending to Meta:
- Email addresses
- First names
- Last names

Implementation: [convex/webhookActions.ts:19-31](convex/webhookActions.ts#L19-L31)

### Event Structure
All events follow Meta's standard format:
- `event_name`: Standard Meta event name (e.g., "Lead", "Purchase")
- `event_time`: Unix timestamp in seconds
- `event_source_url`: Your website URL
- `action_source`: "website"
- `user_data`: Hashed PII (email, first name, last name)
- `custom_data`: Event-specific parameters
- `event_id`: Unique ID for deduplication (Purchase events only)

### Standard Event Parameters

#### Lead Event
```typescript
{
  content_name: "User Sign Up",
  content_category: "Authentication",
  status: "completed"
}
```

#### Purchase Event
```typescript
{
  value: 69 | 169,           // Package price in USD
  currency: "USD",
  content_name: "Standard Credit Package" | "Premium Credit Package",
  content_type: "product",
  order_id: "order_123...",  // LemonSqueezy order ID
}
```

## Testing

### Test Lead Event
1. Create a new user account via sign-up page
2. Check Convex logs for: `"✓ Lead event tracked successfully for user: ..."`
3. Verify in Meta Events Manager (wait 10-15 minutes for processing)

### Test Purchase Event
1. Make a test purchase using LemonSqueezy test mode
2. Check Convex logs for: `"✓ Purchase event tracked successfully for user: ..."`
3. Check browser console for: `"Meta Pixel: Purchase event tracked for ..."`
4. Verify in Meta Events Manager (both events should show, but count as one)

## Deduplication Details

Meta deduplicates events based on:
- Matching `event_id`
- Matching `event_name`
- Within 48-hour time window

Our implementation generates event_id format: `purchase_{timestamp}_{random}`

Example: `purchase_1703123456789_a3f9x2`

## Key Files Reference

- **[convex/webhookActions.ts](convex/webhookActions.ts)**: Core Meta Conversion API integration
- **[convex/http.ts](convex/http.ts)**: Clerk and LemonSqueezy webhook handlers
- **[src/app/(app)/settings/billing/page.tsx](src/app/(app)/settings/billing/page.tsx)**: Client-side Purchase tracking
- **[src/app/api/lemonsqueezy/checkout/route.ts](src/app/api/lemonsqueezy/checkout/route.ts)**: Checkout API with event_id passthrough
- **[src/contexts/auth-context.tsx](src/contexts/auth-context.tsx)**: Auth provider (client-side Lead tracking removed)

## Troubleshooting

### Lead Events Not Appearing
- Check Convex logs for errors
- Verify `CLERK_WEBHOOK_SECRET` is set correctly
- Ensure Clerk webhook is configured with `user.created` event
- Confirm `META_CONVERSION_API_ACCESS_TOKEN` and `NEXT_PUBLIC_META_PIXEL_ID` are set in Convex

### Purchase Events Not Appearing
- Check both Convex logs and browser console
- Verify `LEMONSQUEEZY_WEBHOOK_SECRET` is set correctly
- Ensure event_id is generated and passed through entire flow
- Check that transaction metadata contains `eventId`
- Confirm both frontend and backend environment variables are set

### Duplicate Purchase Events
- Verify event_id is being generated before checkout
- Check that same event_id appears in both client and server logs
- Ensure Meta Pixel is using `eventID` (capital ID) parameter
- Wait 24-48 hours for Meta's deduplication to process

## Best Practices Implemented

✅ Server-side tracking for reliable Lead events
✅ PII hashing (SHA-256) for privacy compliance
✅ Event deduplication for Purchase events
✅ Standard Meta event names and parameters
✅ Error handling with graceful fallbacks
✅ Detailed logging for debugging
✅ Event_id stored in transaction metadata for retrieval

## Meta Events Manager

Access your events at: https://business.facebook.com/events_manager2/

Expected metrics:
- **Lead Events**: One per new user signup
- **Purchase Events**: One per completed order (deduplicated from dual tracking)

Note: Events may take 10-15 minutes to appear in the dashboard. Deduplication processing can take up to 48 hours.
