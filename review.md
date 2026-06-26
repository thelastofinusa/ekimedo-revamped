# Ekimedo Atelier Codebase Review: Improvements & Fixes

This document provides a systematic review of the Ekimedo Atelier codebase. It highlights critical issues, suggests improvements, and recommends best practices to enhance security, performance, maintainability, and reliability.

---

## Table of Contents

1. [Security & Authentication](#security--authentication)
2. [Payment & Webhook Integrity](#payment--webhook-integrity)
3. [Concurrency & Race Conditions](#concurrency--race-conditions)
4. [Error Handling & Resilience](#error-handling--resilience)
5. [Performance & Optimization](#performance--optimization)
6. [Code Quality & Maintainability](#code-quality--maintainability)
7. [TypeScript & Type Safety](#typescript--type-safety)
8. [Sanity CMS & Data Access](#sanity-cms--data-access)
9. [Testing & Monitoring](#testing--monitoring)
10. [Environment & Configuration](#environment--configuration)

---

## Security & Authentication

### 1. Exposed Secret Keys in Keyless Mode
- **File**: `.clerk/.tmp/keyless.json`
- **Issue**: Contains `secretKey` and `publishableKey` for a Clerk instance. The `.gitignore` correctly excludes the `.clerk/` directory, but during development, these secrets may be accidentally committed or exposed.
- **Fix**: Ensure the `.clerk/` directory is never included in version control (already ignored). For production, use environment variables instead of keyless mode.

### 2. Turnstile Captcha Verification
- **File**: `lib/security.ts` (Turnstile)
- **Issue**: The `verifyTurnstileToken` function uses `fetch` without a timeout. If the Turnstile service is slow or down, the request may hang.
- **Fix**: Add a timeout (e.g., 5 seconds) and fallback to allow requests in development.

### 3. File Upload Validation
- **File**: `lib/security.ts` (`validateImageUpload`)
- **Issue**: Only checks file type and header signature. Does not validate against malicious content (e.g., embedded scripts, SVG with XSS).
- **Fix**: Restrict uploads to safe image MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforce file extension validation. Consider using a library like `sharp` to sanitize images.

### 4. Rate Limiting Implementation
- **File**: `lib/security.ts`
- **Issue**: Rate limiting uses an in‑memory `Map`. This is not shared across server instances (e.g., when using multiple Node.js processes or serverless functions). Also, the store never gets cleaned up, leading to memory leaks.
- **Fix**: Use a distributed cache (Redis) or a database-backed store. For serverless, consider using a service like Upstash or a middleware with a global store. Also implement cleanup for expired entries.

### 5. Security Headers Missing
- **File**: `next.config.ts`
- **Issue**: No Content Security Policy (CSP), HSTS, X‑Frame‑Options, or other security headers are set.
- **Fix**: Add security headers via Next.js middleware or `next.config.ts`. At minimum:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - CSP with appropriate directives.

### 6. Clerk Authentication – Sensitive Routes
- **Files**: `actions/*.action.ts`
- **Issue**: Some server actions rely on `auth()` and `currentUser()` but do not handle missing user gracefully. For example, `bookConsultation` throws an error if `userId` is missing.
- **Fix**: Return a `{ success: false, message: "Unauthorized" }` response instead of throwing, and handle it on the client.

---

## Payment & Webhook Integrity

### 1. Stripe Webhook Idempotency
- **File**: `app/api/webhooks/stripe/route.ts`
- **Issue**: The webhook handler checks for existing order by `orderId` and booking by `bookingId`, but race conditions may still cause duplicate processing if multiple webhook events arrive simultaneously.
- **Fix**: Use Stripe’s `idempotency_key` header to avoid duplicates. Store the `event.id` in a database and reject duplicate events.

### 2. Webhook Signature Verification
- **File**: `app/api/webhooks/stripe/route.ts`
- **Issue**: The `webhookSecret` is read from `process.env.STRIPE_WEBHOOK_SECRET`, but there’s no fallback or validation. If the variable is missing, the endpoint will fail silently.
- **Fix**: Add a check to ensure the secret is set; in development, you may allow a fallback, but production must have it configured.

### 3. Order Creation Race Condition
- **File**: `app/api/webhooks/stripe/route.ts`
- **Issue**: The order creation uses `createOrderAndDecrementStock` with a transaction. However, if the webhook is retried after the order already exists, the code checks `existingOrder` and skips, but the stock decrement is already done. That’s correct, but the email sending logic might be skipped if the order already exists.
- **Fix**: Ensure that if an order already exists, you don’t resend emails; that’s already done. But consider idempotency more robustly: store the event ID and process only once.

### 4. Payment Method Handling
- **Files**: `actions/consultation.action.ts`, `actions/order.action.ts`
- **Issue**: The `payment_method_types` array includes `"paypal"` but the PayPal integration is not implemented. The code comments indicate it's not supported.
- **Fix**: Remove PayPal from the payment method options or implement proper PayPal integration using Stripe’s `payment_method_types` or a separate gateway. For now, disable PayPal completely.

---

## Concurrency & Race Conditions

### 1. Stock Decrement and Order Creation
- **File**: `actions/order.action.ts` (`createOrderAndDecrementStock`)
- **Issue**: The transaction uses `patch.ifRevisionId(product._rev)` to ensure the product hasn’t changed, but this only prevents concurrent updates if the product revision changes. If two orders attempt to decrement stock simultaneously, the second one will fail if the revision has changed, but the transaction will be rolled back. This is acceptable but may cause order failures under high load.
- **Fix**: Consider using atomic operations (e.g., `patch.dec({ stock: item.quantity })`) without revision check if you want to allow concurrent decrements, but ensure you validate stock sufficiency first and handle negative stock gracefully. The current approach is safe but may lead to failed orders.

### 2. Cart Stock Validation
- **File**: `hooks/cart-stock.ts`
- **Issue**: The `useCartStock` hook fetches stock from Sanity on the client, which could become stale. There’s a race condition between the client checking stock and the server processing the order.
- **Fix**: Move stock validation to the server side during checkout, which is already done in `createCheckoutSession`. That is sufficient. The client-side check is a UX enhancement; ensure it doesn't block the user, but the server will enforce the actual stock.

### 3. Booking Availability Race Condition
- **File**: `actions/consultation.action.ts` (`bookConsultation`)
- **Issue**: The availability is checked early, but between that check and booking creation, another booking might fill the slot. The code does not re‑check availability after creating the booking. This could lead to double‑booking.
- **Fix**: In the booking creation transaction, include a check that the slot is still available (e.g., by querying for existing bookings for that time slot and date). Use a Sanity transaction to ensure atomicity.

---

## Error Handling & Resilience

### 1. Server Actions – Uncaught Errors
- **Files**: `actions/*.action.ts`
- **Issue**: Many server actions catch errors but return generic messages. Some errors (like validation failures) are not properly propagated.
- **Fix**: Use a consistent error handling pattern. For validation, return structured errors (e.g., using `zod`’s `format()`) so the UI can display field‑specific errors. For unexpected errors, log the error and return a generic safe message.

### 2. Email Queue with `after` API
- **File**: `lib/email-queue.ts`
- **Issue**: The `queueEmailTask` uses `after` from `next/server`, which runs after the response is sent. However, if the serverless function terminates before the `after` callback completes (e.g., in Vercel with a timeout), emails may not be sent.
- **Fix**: Use a dedicated queue (e.g., BullMQ, Redis) or a webhook‑based async process. Alternatively, use a background job service like Vercel’s `waitUntil` if available, but `after` is not guaranteed to execute in all environments.

### 3. File Upload – No Rollback on Failure
- **File**: `actions/inquiry.action.ts`, `actions/review.action.ts`
- **Issue**: If the inquiry submission fails after file uploads, the uploaded assets remain orphaned in Sanity.
- **Fix**: Implement a cleanup routine that deletes uploaded assets if the server action fails. Use a transaction approach: either store the upload results and, if final submission fails, delete the assets.

### 4. Rate Limiting Exceptions
- **File**: `lib/security.ts` (`enforceRateLimit`)
- **Issue**: The `enforceRateLimit` function throws a `SecurityError` with status 429. However, in server actions, these errors are caught and returned as `{ success: false, message: ... }`, but the status code is lost. The UI might not distinguish rate limit errors from other errors.
- **Fix**: Return a specific error code or flag so the frontend can handle rate limiting appropriately (e.g., display a "Too many requests" message).

### 5. Stripe Session Creation Failure
- **File**: `actions/consultation.action.ts`
- **Issue**: If Stripe session creation fails, the booking is marked as "cancelled". However, the error message returned to the client may include sensitive information (e.g., error details). Also, the cancellation might not be ideal if the payment method is PayPal.
- **Fix**: Always log the full error on the server, but only send a generic message to the client. If PayPal is unsupported, inform the user clearly.

---

## Performance & Optimization

### 1. Image Optimization
- **File**: `next.config.ts`
- **Issue**: `unoptimized: true` disables Next.js Image optimization, which can lead to huge images and poor performance.
- **Fix**: Remove `unoptimized: true` or set it conditionally for development. Use `images.formats: ['image/webp', 'image/avif']` to serve modern formats. Also configure proper `remotePatterns` for Sanity images.

### 2. Client‑Side Fetching in Hooks
- **File**: `hooks/cart-stock.ts`
- **Issue**: The hook fetches stock data directly from Sanity client on the client. This exposes the Sanity client to the browser, which may not be ideal. Also, it adds client‑side network requests.
- **Fix**: Move stock fetching to a server action or an API route that returns the stock for the cart items. This centralizes access and reduces client‑side data exposure.

### 3. Large Server Actions Payload
- **File**: `actions/order.action.ts` (`createCheckoutSession`)
- **Issue**: The `createCheckoutSession` server action receives a FormData with a stringified `items` array. This can be large if the cart has many items.
- **Fix**: Consider passing only product IDs and quantities, and fetch product data on the server. Also, ensure the `bodySizeLimit` in `next.config.ts` is sufficient.

### 4. Overfetching in Queries
- **File**: `sanity/queries/*.query.ts`
- **Issue**: Many queries fetch all fields, even when only a few are needed (e.g., `QUERY_PRODUCT` fetches everything). This increases payload size and Sanity usage.
- **Fix**: Tailor each query to only fetch the fields actually needed for that specific page/component. Use projections effectively.

### 5. Next.js Cache and Revalidation
- **File**: `sanity/lib/client.ts`
- **Issue**: `clientOptions` sets `{ next: { revalidate: 300 } }` globally. This may be too aggressive for some data (e.g., static content) and too lazy for real‑time stock.
- **Fix**: Use per‑query revalidation strategies. For stock and orders, use `revalidate: 0` or disable caching. For static content, use `revalidate: 3600` or `force-cache`.

### 6. Cart Re‑hydrating and Persistence
- **File**: `components/providers/cart.provider.tsx`
- **Issue**: The cart store persists to localStorage, but the rehydration happens only on mount. If the user closes and reopens the tab, the cart is restored. However, there’s no sync with server‑side stock updates.
- **Fix**: On rehydration, validate each cart item’s stock with the server and remove or adjust quantities if stock changed.

---

## Code Quality & Maintainability

### 1. Duplicate Code in Email Previews
- **File**: `app/(pages)/email/page.tsx`
- **Issue**: Many email preview components are defined inline with hard‑coded data. This is fine for development, but the file is large and repetitive.
- **Fix**: Move the preview data into a separate config or factory function. Consider using a more systematic approach to generate email previews, e.g., using a data generator.

### 2. Inconsistent Naming Conventions
- **Files**: `constants/`, `lib/`, `components/`
- **Issue**: Some files use camelCase (`order.ts`, `stock.ts`), others use kebab‑case (`consultation.action.ts`). Inconsistent naming makes navigation harder.
- **Fix**: Choose a convention (e.g., kebab‑case for files) and stick to it. For example, use `order.action.ts` → `order-actions.ts` or `orderActions.ts`. The project currently mixes both.

### 3. Large Component Files
- **File**: `app/(pages)/consultations/[slug]/components/render.tsx`
- **Issue**: This file contains multiple complex components (`RenderControl`, `DateTimeField`, `FileField`, etc.) and is over 300 lines. It’s hard to maintain.
- **Fix**: Split into smaller files: `RenderControl.tsx`, `DateField.tsx`, `DateTimeField.tsx`, `FileField.tsx`. Create a dedicated directory for each form field type.

### 4. Magic Numbers and Hard‑Coded Values
- **Files**: `lib/time.ts` (timezone "America/New_York"), `actions/consultation.action.ts` (SLOT_INTERVAL = 30)
- **Issue**: Hard‑coded constants are scattered. If the business changes (e.g., slot interval changes), you need to update multiple places.
- **Fix**: Centralize constants in `constants/` files. For example, `BOOKING_TIMEZONE` and `SLOT_INTERVAL` could go into `constants/booking.ts`.

### 5. Use of `any` in TypeScript
- **Files**: Many files (e.g., `app/api/webhooks/stripe/route.ts`, `actions/order.action.ts`)
- **Issue**: `any` is used frequently, defeating type safety.
- **Fix**: Replace `any` with proper types. Use `unknown` and type guards when data is from external sources (e.g., Stripe webhooks). Leverage generated Sanity types.

### 6. Inline Styles and Unnecessary `style` Attributes
- **Files**: `components/emails/*.email.tsx`
- **Issue**: The email components use React Email components, but some inline styles are not responsive or use hard‑coded pixels.
- **Fix**: Use the `Tailwind` component from `@react-email/components` for consistent styling. Ensure emails are tested across clients.

### 7. Mixed Client/Server Components
- **Files**: Many pages use `"use client"` at the top of files, including server components that shouldn't be client components.
- **Issue**: Overusing `"use client"` reduces the benefits of React Server Components and increases bundle size.
- **Fix**: Only add `"use client"` to components that truly need client‑side interactivity (hooks, state, context). Move non‑interactive parts to server components.

---

## TypeScript & Type Safety

### 1. Missing Explicit Return Types for Server Actions
- **Files**: `actions/*.action.ts`
- **Issue**: Many server actions return arbitrary objects without a clear type. This makes it hard for the client to know the shape of the response.
- **Fix**: Define a union type for all possible return values (e.g., `{ success: true; url: string } | { success: false; message: string }`). Use `zod` to infer the type.

### 2. Unsafe Type Assertions
- **File**: `actions/order.action.ts` (`validateStockAndCalculateTotal`)
- **Issue**: `const products = products.find(p => p._id === productId)` but the type is `any` or not properly narrowed.
- **Fix**: Use the generated Sanity types (`QUERY_PRODUCT_BY_IDS_RESULT`) and properly handle `undefined`.

### 3. Sanity TypeGen Inconsistencies
- **File**: `sanity.types.ts`
- **Issue**: The generated types are comprehensive, but some queries use `*[_type == ...]` without explicit typing, leading to `any` in some places.
- **Fix**: Ensure all queries are wrapped with `defineQuery` and have proper return types. The TypeGen should generate correct types if the queries are well‑defined.

### 4. Environment Variable Typing
- **File**: `lib/utils.ts` (`assertValue`)
- **Issue**: The `assertValue` helper throws if a variable is undefined, but the frontend also uses environment variables. There’s no type safety for env variables.
- **Fix**: Use a library like `@t3-oss/env-nextjs` to validate environment variables at runtime and provide typed access.

---

## Sanity CMS & Data Access

### 1. Lack of Indexes on Frequently Queried Fields
- **Issue**: Sanity queries filter on `slug.current`, `_type`, `clerkUserId`, `stripeSessionId`, etc. Without proper indexes (or if queries aren't optimized), performance may degrade.
- **Fix**: Add Sanity `__unsafe` indexes for fields like `slug.current`, `stripeSessionId`, `clerkUserId`, etc. You can do this via the Sanity CLI or dataset settings.

### 2. Inconsistent Use of `next-sanity` Live API
- **File**: `app/(pages)/consultations/page.tsx` uses `sanityFetch` with live, but other pages use `client.fetch` with static options. This leads to inconsistent revalidation.
- **Fix**: Standardize on `sanityFetch` for all data fetching to benefit from Live Content API and consistent caching.

### 3. Potential N+1 Queries in Product Fetching
- **File**: `sanity/queries/orders.query.ts` (`QUERY_ORDERS_BY_USER`)
- **Issue**: The query fetches `items[].product->name` and `items[].product->snapshots[0]`. This is a GROQ join, which should be efficient, but if there are many orders, it could be heavy.
- **Fix**: Ensure that you only fetch the data you need. If performance is an issue, consider denormalizing product names and image URLs into the order document when the order is created.

### 4. Hard‑Coded Document IDs
- **File**: `sanity/queries/hour.query.ts` (`*[_id == "businessHours"][0]`)
- **Issue**: This relies on a specific document ID. If the document is deleted or renamed, the query fails.
- **Fix**: Use a singleton pattern for globally unique documents (e.g., `"businessHours"`). In Sanity, you can enforce a singleton via `__experimental_actions` to prevent deletion. Ensure the document is always created.

### 5. Race Condition in Stock Decrement (Revisited)
- **File**: `actions/order.action.ts`
- **Issue**: The stock decrement transaction uses `patch.ifRevisionId(product._rev)`. If there’s a concurrent update, the transaction fails and the whole order creation fails. This could cause an order to fail even if stock is sufficient.
- **Fix**: Instead of checking revision, just use `patch.dec({ stock: item.quantity })` and then verify the resulting stock is non‑negative after the update (using a conditional patch). This allows concurrent decrements safely. For example:
  ```
  patch.dec({ stock: item.quantity }).gt({ stock: 0 })
  ```
  This ensures stock never goes negative.

---

## Testing & Monitoring

### 1. No Unit or Integration Tests
- **Issue**: The codebase lacks tests. Critical functions like `bookConsultation`, `createCheckoutSession`, and webhook handling are untested.
- **Fix**: Start with unit tests for utility functions, schema validations, and helper methods. Then add integration tests for server actions and API routes using tools like Jest and Supertest.

### 2. Logging and Error Monitoring
- **Issue**: `console.error` is used in many places, but there’s no centralized logging solution for production. Errors are not captured by monitoring tools.
- **Fix**: Integrate a logging service (e.g., Sentry, Logtail, or DataDog). Use `next-sentry` to capture both client and server errors.

### 3. Lack of Health Checks
- **Issue**: No `/api/health` endpoint to monitor the application status, database connectivity, or external services (Stripe, Resend, Clerk).
- **Fix**: Add a health check endpoint that verifies critical dependencies and returns a 200 status.

---

## Environment & Configuration

### 1. Missing Production Environment Variables
- **Issue**: The code relies on many environment variables: `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `RESEND_FROM_EMAIL`, etc. Some are only defined in development.
- **Fix**: Ensure all required variables are documented in a `.env.example` file. Validate their presence on app start (e.g., in `next.config.ts`).

### 2. Hard‑Coded `NODE_ENV` Checks
- **File**: `config/site.config.ts`
- **Issue**: `url` is set based on `process.env.NODE_ENV`. In production, it uses `NEXT_PUBLIC_SITE_URL`. This might be undefined.
- **Fix**: Fallback to a default URL if `NEXT_PUBLIC_SITE_URL` is not set, or ensure it's always set.

### 3. Use of `process.env` in Client‑Side Code
- **File**: `components/shared/turnstile.tsx`
- **Issue**: The component uses `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY`, which is fine because it's prefixed with `NEXT_PUBLIC`. However, ensure all public env vars are correctly exposed.
- **Fix**: Double‑check that all `NEXT_PUBLIC_*` variables are defined in the build environment.

---

## Additional Miscellaneous Fixes

- **Missing `key` props in maps**: Some lists lack proper `key` props (e.g., in `ReviewsComp`). Add them to avoid React warnings.
- **Potential XSS in `dangerouslySetInnerHTML`**: None found, but if you ever use it, ensure content is sanitized.
- **Accessibility**: Check that all interactive elements have proper ARIA labels and that the site is usable with keyboard navigation.
- **Mobile Responsiveness**: The use of `isMobile` hook might be inconsistent; ensure that mobile view is thoroughly tested.
- **Missing `sanity.cli.ts` and `sanity.config.ts`**: These are present, but note that the Studio is exposed at `/admin` – ensure it is protected in production (e.g., with authentication). The `Clerk` integration is not currently protecting the Studio route; consider adding a middleware or a custom auth check.

---

## Summary of Priority Fixes

| Priority | Issue | Suggested Action |
|----------|-------|------------------|
| **Critical** | Stripe webhook idempotency and race conditions | Store event IDs, handle duplicate events, use `gt` patch for stock. |
| **Critical** | Rate limiting memory leak | Implement a distributed rate limiter. |
| **High** | Stock decrement concurrency | Use conditional patch to avoid negative stock. |
| **High** | Security headers missing | Add CSP and other headers in middleware. |
| **High** | Unoptimized images | Remove `unoptimized: true` and configure remote patterns. |
| **Medium** | Server action error handling | Return structured errors, handle validation properly. |
| **Medium** | Email queue reliability | Use a job queue or ensure `after` is reliable in your environment. |
| **Medium** | Centralize constants | Move hard‑coded values to `constants/`. |
| **Low** | TypeScript `any` usage | Replace with proper types. |
| **Low** | Duplicate code in email previews | Refactor into a config file. |

---

## Conclusion

This review highlights several areas for improvement, from critical security and concurrency issues to code quality and performance optimizations. Addressing these points will make the application more robust, secure, and maintainable. Start with the critical fixes, especially those related to payment and stock integrity, then gradually tackle the high‑priority items. Regular code reviews and automated testing will help prevent future regressions.

**Note**: This analysis is based on the provided codebase snapshot. Some issues may have been addressed in the latest commits; verify before implementation.