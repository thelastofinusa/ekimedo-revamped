# Tasks - Codebase Improvements & Fixes

- `[x]` Create booking constants and centralize timezone configuration
- `[x]` Update `lib/security.ts` (Turnstile timeout, Image upload extensions, Rate limiting memory pruning)
- `[x]` Update `next.config.ts` (Image optimization, Security headers)
- `[x]` Update `lib/email-queue.ts` (`after` presence check)
- `[x]` Update `actions/order.action.ts` (Explicit return types, Atomic conditional stock patch)
- `[x]` Update `app/api/webhooks/stripe/route.ts` (Webhook secret check, Booking update idempotency)
- `[x]` Update `actions/consultation.action.ts` (Explicit return types, Post-booking double-booking check)
- `[x]` Update `actions/inquiry.action.ts` (Explicit return types, Orphaned assets cleanup)
- `[x]` Update `actions/review.action.ts` (Explicit return types, Orphaned assets/avatar cleanup)
- `[x]` Update `actions/contact.action.ts` (Explicit return types)
- `[x]` Create `app/api/health/route.ts` (Sanity connectivity health check endpoint)
- `[/]` Verify changes using `bun run build` and `bun run lint`

