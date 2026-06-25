# Ekimedo Revamped – Full Fix & Optimization Prompt

## Context
This is a Next.js 16 + Sanity Studio + Clerk + Stripe/PayPal consultation booking app.
The codebase is at: https://github.com/thelastofinusa/ekimedo-revamped

---

## Problems to Fix

### 1. CRITICAL – Server Action crashes in production (Server Components render error)
**Root cause:** The `bookConsultation` server action in `actions/consultation.action.ts`
uploads files (`File[]`) from the server action body. When a user attaches images,
the body grows beyond Vercel's limit and the function crashes silently in production.
The `uploadFieldFiles()` function calls `writeClient.assets.upload()` with raw
`File` objects received through the server action. File data should never travel
through server actions — files must be uploaded from the client directly.

**Fix:** Implement **client-side pre-upload** to Sanity using a signed upload token:

1. **Create `app/api/sanity-upload-token/route.ts`:**
```ts
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Generate a short-lived upload token (Sanity supports this via their API)
  const token = await writeClient.request({
    uri: "/assets/upload-token",
    method: "POST",
    json: true,
    body: { ttl: 300, permissions: ["image"] },
  });

  return NextResponse.json({ token });
}
```

2. **In the client form component (`app/(pages)/consultations/[slug]/components/submit.tsx`),**
before calling `bookConsultation`, upload all `File[]` fields to Sanity first,
collect the returned `asset._id` strings, then pass those IDs (not File objects)
in the payload:

```ts
async function uploadFilesToSanity(files: File[]): Promise<string[]> {
  const tokenRes = await fetch("/api/sanity-upload-token");
  const { token } = await tokenRes.json();

  const ids: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `https://api.sanity.io/v2021-03-25/assets/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    const data = await res.json();
    ids.push(data.document._id);
  }
  return ids;
}
```

3. **In `onSubmit` in `submit.tsx`**, find all `file` fields in the payload,
upload them first, replace `File[]` values with `string[]` of asset IDs:

```ts
// Before calling bookConsultation
const processedPayload = { ...payload };
for (const [key, value] of Object.entries(processedPayload)) {
  if (Array.isArray(value) && value[0] instanceof File) {
    const assetIds = await uploadFilesToSanity(value as File[]);
    processedPayload[key] = assetIds; // now just string IDs
  }
}
const result = await bookConsultation(processedPayload);
```

4. **In `actions/consultation.action.ts`**, update the `file` type handler
to receive `string[]` (asset IDs) instead of `File[]`, and build the references directly:

```ts
if (field.type === "file") {
  const assetIds = (Array.isArray(rawValue) ? rawValue : [rawValue]) as string[];
  const files = assetIds.map((id) => ({
    _type: "image" as const,
    _key: randomUUID(),
    asset: { _type: "reference" as const, _ref: id },
  }));
  formFields.push({
    _key: randomUUID(),
    fieldName: field.name,
    fieldLabel: field.label || field.name,
    fieldType: field.type,
    value: `${files.length} image(s) uploaded`,
    files,
  });
  continue;
}
```

5. **Remove `uploadFieldFiles()` function** from `consultation.action.ts` entirely.

---

### 2. PayPal Integration (replace broken Stripe PayPal workaround)
The current code passes `"paypal"` to `payment_method_types` on the Stripe session,
which Stripe rejects unless PayPal is explicitly enabled on your Stripe account.
Implement a proper **PayPal Orders API** integration:

**A. Install PayPal SDK:**
```bash
bun add @paypal/paypal-server-sdk
# or use the REST API directly with fetch
```

**B. Create `lib/paypal.ts`:**
```ts
const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json();
  return data.access_token;
}

export async function createPayPalOrder(amount: number, bookingId: string, returnUrl: string, cancelUrl: string) {
  const token = await getPayPalToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": bookingId, // idempotency key
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId,
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: "Consultation booking fee",
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "Ekimedo",
        user_action: "PAY_NOW",
      },
    }),
  });
  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}
```

**C. Update `actions/consultation.action.ts`** — in the payment branching:
```ts
import { createPayPalOrder } from "@/lib/paypal";

// After booking is created in Sanity...

if (paymentMethod === "paypal") {
  const order = await createPayPalOrder(
    amount,
    bookingId,
    `${siteConfig.url}/consultations/${consultationSlug}?payment=success&booking_id=${bookingId}`,
    `${siteConfig.url}/consultations/${consultationSlug}?payment=failed&booking_id=${bookingId}`
  );
  if (!order.id) {
    await writeClient.patch(bookingId).set({ status: "cancelled" }).commit();
    return { success: false, message: "PayPal order creation failed." };
  }
  await writeClient.patch(bookingId).set({ paypalOrderId: order.id }).commit();
  const approveLink = order.links?.find((l: { rel: string }) => l.rel === "approve")?.href;
  return { success: true, url: approveLink, bookingId, consultationSlug: consultationSlug as string };
}

// Stripe path below (card only — no paypal in payment_method_types)
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"], // ← ALWAYS just "card" now
  // ... rest of session params
});
```

**D. Create `app/api/paypal/capture/route.ts`** (PayPal redirect lands here or handle in the consultation page):
```ts
import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { writeClient, client } from "@/sanity/lib/client";
import { getResend } from "@/lib/resend";
// import email components

export async function POST(req: NextRequest) {
  const { orderId, bookingId } = await req.json();

  const capture = await capturePayPalOrder(orderId);
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  // Mark booking as paid
  await writeClient.patch(bookingId).set({
    status: "paid",
    paypalOrderId: orderId,
  }).commit();

  // Fetch booking and send confirmation emails (same pattern as Stripe webhook)
  // ... fetch booking, send admin + customer emails via resend

  return NextResponse.json({ success: true });
}
```

**E. Update the consultation page** (`app/(pages)/consultations/[slug]/page.tsx`)
to detect PayPal return: when `?payment=success&booking_id=X` is in the URL
AND the booking's `paymentMethod === "paypal"`, call the capture endpoint
(or handle it server-side in a useEffect on the client).

**F. Add env vars to `.env.local` and Vercel:**
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox  # change to "live" for production
```

---

### 3. Fix `payment_method_types` TypeScript error and broken Stripe call
In `actions/consultation.action.ts`, the current line:
```ts
payment_method_types: [paymentMethod as "card" | "paypal"],
```
Must be changed to:
```ts
payment_method_types: ["card"],
```
PayPal is now handled via its own native API (see fix #2 above).

---

### 4. Performance & Vercel CPU Optimization

**A. Add ISR/caching to Sanity queries in server components**

In every server component that fetches from Sanity, use Next.js `cache` and revalidation:
```ts
import { unstable_cache } from "next/cache";

export const getConsultation = unstable_cache(
  async (slug: string) => client.fetch(QUERY_CONSULTATION_BY_SLUG, { slug }),
  ["consultation"],
  { revalidate: 60 } // revalidate every 60 seconds
);
```

Apply this pattern to: consultation queries, business hours, blocked slots.
These are read far more often than they change.

**B. Move the Sanity asset uploads to Sanity's CDN edge**

Already covered in Fix #1 — by uploading directly from the client browser to Sanity,
you eliminate the Vercel server from the file upload path entirely.
This alone will drastically cut Fluid CPU time since large binary payloads no longer
flow through your serverless functions.

**C. Parallelize independent Sanity fetches in `bookConsultation`**

Currently, the action does 3+ sequential fetches. Run independent ones in parallel:
```ts
const [availability, consultation] = await Promise.all([
  getAvailableTimes(consultationSlug as string, dateStr),
  client.fetch(CONSULTATION_QUERY, { slug: consultationSlug }),
]);
```

**D. Add `export const maxDuration = 10` to the consultation page**
For Vercel Fluid, this caps the function's max execution time and prevents runaway
billable CPU from stuck requests:
```ts
// app/(pages)/consultations/[slug]/page.tsx
export const maxDuration = 10;
```

**E. Enable React `cache()` for repeated Clerk calls**

In `consultation.action.ts`, wrap `currentUser()` and `auth()`:
```ts
import { cache } from "react";
const getUser = cache(async () => {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  return { userId, user };
});
```

**F. Split `next.config.ts` body size limit**

The current `MAX_SERVER_BODY_SIZE_MB = 40mb` applies globally. After fixing file uploads
to go client-side (Fix #1), reduce this significantly:
```ts
serverActions: {
  bodySizeLimit: "2mb", // no files go through server actions anymore
},
```
This prevents accidental large payloads from burning CPU on Vercel.

---

### 5. Scalability for 4k users/minute

**A. Add Sanity CDN for all read queries**

In `sanity/lib/client.ts`, ensure `useCdn: true` is set on the public read client:
```ts
export const client = createClient({
  ...config,
  useCdn: true, // serves reads from Sanity's global CDN
  perspective: "published",
});
```
Only `writeClient` should have `useCdn: false`.

**B. Use `next/cache` tags for on-demand revalidation**

Tag Sanity fetches so Sanity webhooks can trigger targeted revalidation:
```ts
const data = await client.fetch(QUERY, params, {
  next: { tags: ["consultation", `consultation:${slug}`] },
});
```

Then create `app/api/sanity-revalidate/route.ts`:
```ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = req.headers.get("x-sanity-webhook-secret");
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const type = body._type;
  revalidateTag(type);
  return NextResponse.json({ revalidated: true });
}
```

Set this up as a webhook in Sanity Studio → API → Webhooks.

**C. Avoid shipping font files via Next.js**

The `/fonts` directory is 64MB. These should be served via `next/font/local` which
automatically optimizes and serves them from Vercel's CDN, not your serverless function.
Update `fonts/index.ts` to use `next/font/local` properly and ensure fonts are
NOT in the `public` directory.

**D. Rate-limit the booking endpoint**

Add simple rate limiting to prevent spam bookings from burning CPU:
```ts
// In bookConsultation action, after auth check:
// Use Vercel's KV or a simple in-memory cache with upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
```

Or use a simpler approach with Vercel Edge Config for now.

---

## Environment Variables to Add

```env
# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or "live"

# Sanity webhook revalidation
SANITY_WEBHOOK_SECRET=generate_a_random_secret
```

---

## Summary of Files to Create/Modify

| File | Action |
|------|--------|
| `app/api/sanity-upload-token/route.ts` | **CREATE** – signed upload token endpoint |
| `app/api/paypal/capture/route.ts` | **CREATE** – PayPal order capture endpoint |
| `app/api/sanity-revalidate/route.ts` | **CREATE** – Sanity webhook revalidation |
| `lib/paypal.ts` | **CREATE** – PayPal API helpers |
| `actions/consultation.action.ts` | **MODIFY** – remove file upload, add PayPal branch, parallelize fetches |
| `app/(pages)/consultations/[slug]/components/submit.tsx` | **MODIFY** – pre-upload files client-side before calling server action |
| `next.config.ts` | **MODIFY** – reduce body size limit to 2mb |
| `sanity/lib/client.ts` | **MODIFY** – ensure useCdn: true on read client |
| `.env.local` | **MODIFY** – add PayPal and webhook secret vars |

---

## Priority Order

1. **Fix #1 (file upload crash)** — this is what's breaking submissions in production RIGHT NOW
2. **Fix #3 (payment_method_types)** — quick Stripe fix, 1 line change
3. **Fix #2 (PayPal)** — enables PayPal payments properly
4. **Fix #4B + #4F (body size + CPU)** — immediate Vercel CPU savings
5. **Fix #5A + #5B (CDN + cache tags)** — scalability
6. **Fix #4A + #4C (ISR + parallel fetches)** — performance polish
