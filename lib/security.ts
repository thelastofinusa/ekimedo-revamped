import "server-only";

import { headers } from "next/headers";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

// Periodic cleanup interval (every 60 seconds worth of calls)
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

export class SecurityError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "SecurityError";
    this.status = status;
  }
}

export async function getRequestIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  // Prune expired entries periodically to prevent memory leaks
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
  const key = `${scope}:${identity || ip}`;
  const result = checkRateLimit({ key, limit, windowMs });

  if (!result.allowed) {
    throw new SecurityError("Too many requests. Please try again later.", 429);
  }

  return result;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  action: string,
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new SecurityError("Captcha is not configured.", 500);
    }
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

  // Abort if Turnstile is slow or down (5-second timeout)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  let response: Response;
  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );
  } catch (err) {
    // In development, allow requests through if Turnstile is unreachable
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

export function verifySanityActionRequest(request: Request) {
  const secret = process.env.SANITY_ACTION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new SecurityError("Sanity action secret is not configured.", 500);
    }
    return true;
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-sanity-action-secret");

  if (bearer !== secret && headerSecret !== secret) {
    throw new SecurityError("Unauthorized.", 401);
  }

  return true;
}

// Map of allowed MIME types to their valid file extensions
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

  // Validate file extension matches declared MIME type
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

export function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "upload";
}
