# Implementation Plan - Ekimedo Revamped Codebase Improvements & Fixes

This plan outlines the systematic implementation of security, payment, concurrency, error handling, and performance improvements identified in the codebase review (`review.md`).

---

## Proposed Changes

### Core Security & Utilities

#### [MODIFY] [lib/security.ts](file:///Users/holiday/Desktop/ekimedo-com/lib/security.ts)
- Add a 5-second timeout using `AbortController` to Turnstile site verification fetch. Add a development fallback to skip blocking captcha failures when keys are not configured or verification fails due to connectivity issues during development.
- Implement file extension validation in `validateImageUpload` (ensuring extension matches MIME type/magic bytes, e.g. `.jpg`/`.jpeg`, `.png`, `.webp`).
- Add a throttled memory pruning routine to the in-memory rate limiter `rateLimitStore` (cleans up expired entries periodically to resolve the memory leak).

#### [MODIFY] [next.config.ts](file:///Users/holiday/Desktop/ekimedo-com/next.config.ts)
- Change `images.unoptimized` to `process.env.NODE_ENV === "development"` to enable Next.js image optimization in production.
- Add static security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

---

### Payments & Webhook Integrity

#### [MODIFY] [app/api/webhooks/stripe/route.ts](file:///Users/holiday/Desktop/ekimedo-com/app/api/webhooks/stripe/route.ts)
- Add validation that `STRIPE_WEBHOOK_SECRET` is set, and log/return error if missing.
- Use `ifRevisionId` on booking updates within the Stripe webhook handler. This will cause concurrent duplicate webhook execution to fail atomically on the second attempt, preventing duplicate emails from being sent to the customer or owner.

#### [MODIFY] [actions/order.action.ts](file:///Users/holiday/Desktop/ekimedo-com/actions/order.action.ts)
- Define explicit return types for all server actions.
- Change product stock decrement in `createOrderAndDecrementStock` from using `ifRevisionId` (which blocks concurrent checkouts for different products or even the same product under high load) to an atomic conditional patch:
  ```typescript
  patch.dec({ stock: item.quantity }).gte({ stock: item.quantity })
  ```
  This guarantees that stock never goes below zero and allows safe concurrent checkouts.

---

### Concurrency & Availability

#### [MODIFY] [actions/consultation.action.ts](file:///Users/holiday/Desktop/ekimedo-com/actions/consultation.action.ts)
- Define explicit return types for all server actions.
- Check slot availability again immediately *after* creating the booking document. If a conflict/double-booking is detected (another booking is paid or was created earlier for the same overlapping time window), delete the newly created document and return a detailed failure message. This prevents race conditions and double-bookings.

---

### Error Handling & Resiliency

#### [MODIFY] [actions/inquiry.action.ts](file:///Users/holiday/Desktop/ekimedo-com/actions/inquiry.action.ts)
- Define explicit return types for all server actions.
- Implement cleanup routine in `catch` blocks: delete uploaded inquiry assets from Sanity if the server action fails or is rejected, avoiding orphaned assets.

#### [MODIFY] [actions/review.action.ts](file:///Users/holiday/Desktop/ekimedo-com/actions/review.action.ts)
- Define explicit return types for all server actions.
- Implement cleanup routine in `catch` blocks: delete uploaded review files and the uploaded Clerk avatar asset from Sanity if the server action fails, avoiding orphaned assets.

#### [MODIFY] [lib/email-queue.ts](file:///Users/holiday/Desktop/ekimedo-com/lib/email-queue.ts)
- Add checking for `after` presence to prevent runtime issues in environments where `after` may not be supported (safely falling back to fire-and-forget async execution).

---

### Code Quality & Standards

#### [NEW] [constants/booking.ts](file:///Users/holiday/Desktop/ekimedo-com/constants/booking.ts)
- Centralize booking constants: `BOOKING_TIMEZONE` ("America/New_York") and `SLOT_INTERVAL` (30 minutes).

#### [MODIFY] [lib/time.ts](file:///Users/holiday/Desktop/ekimedo-com/lib/time.ts)
- Update timezone configuration to import from `constants/booking.ts` instead of hardcoding.

#### [MODIFY] [actions/contact.action.ts](file:///Users/holiday/Desktop/ekimedo-com/actions/contact.action.ts)
- Define explicit return types for the server action.

#### [NEW] [app/api/health/route.ts](file:///Users/holiday/Desktop/ekimedo-com/app/api/health/route.ts)
- Add a lightweight, secure health check endpoint (`/api/health`) verifying database (Sanity client) connectivity.

---

## Verification Plan

### Automated Tests
- Build verification: Run `bun run build` to verify there are no compilation or TypeScript errors.
- Code style: Run `bun run lint` to verify eslint compliance.

### Manual Verification
- Test Turnstile captcha timeout handling by introducing temporary delay in development logic.
- Verify image upload files validation by trying to upload non-matching files (e.g. text file renamed to .png).
- Check the `/api/health` endpoint response in a browser or curl.
