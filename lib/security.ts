import "server-only";

import { headers } from "next/headers";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate limit store
// NOTE: This resets on cold starts on Vercel serverless.
// For production hardening, replace with Vercel KV / Upstash Redis.
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitStore = new Map<string, RateLimitState>();

const PRUNE_INTERVAL_MS = 60_000;
let lastPruneAt = Date.now();

function pruneExpiredEntries() {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  for (const [key, state] of rateLimitStore) {
    if (state.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SecurityError
// ─────────────────────────────────────────────────────────────────────────────

export class SecurityError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "SecurityError";
    this.status = status;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IP Resolution
// Uses x-real-ip (set by Vercel infrastructure, cannot be spoofed) first.
// Falls back to the LAST entry of x-forwarded-for (added by Vercel's edge,
// earlier entries are user-controlled and spoofable).
// ─────────────────────────────────────────────────────────────────────────────

export async function getRequestIp(): Promise<string> {
  const headerStore = await headers();

  // x-real-ip is injected by Vercel and cannot be forged by the client
  const realIp = headerStore.get("x-real-ip");
  if (realIp) return realIp.trim();

  // The LAST value in x-forwarded-for is appended by Vercel's edge proxy
  // and is trustworthy. Earlier values are passed through from the client.
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    const entries = forwardedFor.split(",");
    const last = entries[entries.length - 1]?.trim();
    if (last) return last;
  }

  return "unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────────────────────

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  pruneExpiredEntries();

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export async function enforceRateLimit(
  scope: string,
  limit: number,
  windowMs: number,
  identity?: string | null,
) {
  const ip = await getRequestIp();
  // Use identity (userId/email) if provided, fall back to IP
  const key = `${scope}:${identity || ip}`;
  const result = checkRateLimit({ key, limit, windowMs });

  if (!result.allowed) {
    throw new SecurityError("Too many requests. Please try again later.", 429);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Turnstile CAPTCHA Verification
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyTurnstileToken(
  token: string | undefined,
  action: string,
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new SecurityError("Captcha is not configured.", 500);
    }
    // Skip in development when secret is not configured
    return true;
  }

  if (!token) {
    throw new SecurityError("Captcha verification is required.", 400);
  }

  const ip = await getRequestIp();
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  let response: Response;
  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        cache: "no-store",
        signal: controller.signal,
      },
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Turnstile verification skipped (unreachable in dev):", err);
      return true;
    }
    throw new SecurityError("Captcha verification timed out.", 503);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new SecurityError("Captcha verification failed.", 400);
  }

  const data = (await response.json()) as {
    success?: boolean;
    action?: string;
  };

  if (!data.success || (data.action && data.action !== action)) {
    throw new SecurityError("Captcha verification failed.", 400);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanity Action Request Verification
// Verifies requests coming from Sanity Studio custom actions
// ─────────────────────────────────────────────────────────────────────────────

export function verifySanityActionRequest(request: Request) {
  const secret = process.env.SANITY_ACTION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new SecurityError("Sanity action secret is not configured.", 500);
    }
    return true;
  }

  const bearer = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-sanity-action-secret");

  if (bearer !== secret && headerSecret !== secret) {
    throw new SecurityError("Unauthorized.", 401);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Upload Validation
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export async function validateImageUpload(file: File) {
  const allowedTypes = new Set(Object.keys(ALLOWED_IMAGE_EXTENSIONS));

  if (!allowedTypes.has(file.type)) {
    throw new SecurityError("Unsupported file type.", 415);
  }

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const validExtensions = ALLOWED_IMAGE_EXTENSIONS[file.type];
  if (!ext || !validExtensions?.includes(ext)) {
    throw new SecurityError(
      `File extension "${ext}" does not match type "${file.type}".`,
      415,
    );
  }

  // Validate magic bytes match actual file content
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47;
  const isWebp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    throw new SecurityError("Invalid image file.", 415);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filename Sanitization
// ─────────────────────────────────────────────────────────────────────────────

export function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "upload";
}
